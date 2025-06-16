import { supabase } from '@/lib/supabase';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import PasswordGate from '../components/PasswordGate';
import { clickSound, errorSound, registeredSound } from '../lib/sounds';

export default function Home() {
  const [idInput, setIdInput] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [advertencia, setAdvertencia] = useState('');
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const obtenerHoraLocal = (fechaISO) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleRegistroAsistencia = async (event) => {
    event.preventDefault();
    clickSound.play();
    const idIngresado = idInput.trim();
    setIdInput('');
    if (inputRef.current) inputRef.current.focus();
    setMensaje('');
    setAdvertencia('');
    setEstudiante(null);

    if (!idIngresado) {
      setMensaje('❌ Por favor ingresa un ID.');
      errorSound.play();
      return;
    }

    // 1. Buscar estudiante
    const { data: estudianteData, error } = await supabase
      .from('estudiantes')
      .select('id, nombre, grupo, foto, correo_electronico')
      .eq('id', idIngresado)
      .single();

    if (error || !estudianteData) {
      setMensaje('❌ Estudiante no encontrado.');
      errorSound.play();
      return;
    }
    setEstudiante(estudianteData);

    // 2. Validar si ya registra hoy
    const ahora = new Date();
    const fechaISO = ahora.toISOString();
    const fechaHoy = fechaISO.split('T')[0];
    const { data: asistenciaHoy } = await supabase
      .from('asistencias')
      .select('id')
      .eq('estudiante_id', estudianteData.id)
      .gte('fecha_hora', `${fechaHoy}T00:00:00.000Z`)
      .lte('fecha_hora', `${fechaHoy}T23:59:59.999Z`)
      .limit(1);

    if (asistenciaHoy.length > 0) {
      setAdvertencia(`⚠️ ${estudianteData.nombre} del grupo ${estudianteData.grupo} ya fue registrado hoy.`);
    }

    // 3. Insertar en Supabase
    const { error: insertError } = await supabase.from('asistencias').insert({
      estudiante_id: estudianteData.id,
      nombre: estudianteData.nombre,
      grupo: estudianteData.grupo,
      fecha_hora: fechaISO,
    });

    if (insertError) {
      setMensaje('❌ Error al registrar la asistencia.');
      errorSound.play();
      return;
    }

    // 4. Éxito local y notificación
    setMensaje(`✅ Asistencia registrada para ${estudianteData.nombre} (${estudianteData.grupo}) a las ${obtenerHoraLocal(fechaISO)}.`);
    registeredSound.play();
    setUltimoRegistro({
      id: estudianteData.id,
      nombre: estudianteData.nombre,
      grupo: estudianteData.grupo,
      fecha_hora: fechaISO,
    });

    // 5. Disparar sincronización completa con Google Sheets
    try {
      const res = await fetch('/api/syncAsistencias', { method: 'POST' });
      const json = await res.json();
      console.log('Sync result:', json);
      if (!res.ok) throw new Error(json.error || 'Sync failed');
    } catch (e) {
      console.error('Error al sincronizar con Sheets:', e);
      // opcional: mostrar advertencia leve
    }

    // 6. Enviar correo (igual que antes)
    const mensajeCorreo = `<html>
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<style>
.container{font-family:Arial,sans-serif;background-color:#f4f4f4;padding:20px;}
.content{background-color:#fff;padding:20px;border-radius:5px;}
.header{background-color:#4a90e2;color:#fff;padding:10px;text-align:center;border-radius:5px 5px 0 0;font-size:18px;}
.body{color:#333;font-size:16px;line-height:1.5;padding:10px 0;}
.footer{font-size:12px;color:#777;text-align:center;margin-top:20px;}
</style></head>
<body>
<div class="container"><div class="content">
<div class="header">Notificación de Llegada al Colegio</div>
<div class="body">
<p>Estimado/a padre/madre/acudiente,</p>
<p>Le informamos que <strong>${estudianteData.nombre}</strong> del grupo <strong>${estudianteData.grupo}</strong> ha llegado al colegio a las <strong>${obtenerHoraLocal(fechaISO)}</strong>.</p>
<p>Saludos cordiales,<br/>Institución Educativa Centenario</p>
</div>
<div class="footer">© ${new Date().getFullYear()} Institución Educativa Centenario.<br/>Con la tecnología de Velvet Attendance, desarrollada por Velvet Digital.</div>
</div></div>
</body></html>`;

    await fetch('/api/enviarCorreo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinatario: estudianteData.correo_electronico,
        asunto: 'Notificación de llegada al colegio',
        mensaje: mensajeCorreo,
      }),
    });
  };

  const handleEliminarUltimoRegistro = async () => {
    clickSound.play();
    if (!ultimoRegistro) return;

    const { error } = await supabase
      .from('asistencias')
      .delete()
      .eq('estudiante_id', ultimoRegistro.id)
      .order('fecha_hora', { ascending: false })
      .limit(1);

    if (error) {
      setMensaje('❌ Error al eliminar el último registro.');
      errorSound.play();
      return;
    }

    await fetch('/api/eliminarAsistencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: ultimoRegistro.id, fecha_hora: ultimoRegistro.fecha_hora }),
    });

    setMensaje(`✅ Se ha eliminado el último registro de ${ultimoRegistro.nombre}.`);
    registeredSound.play();
    setUltimoRegistro(null);
  };

  return (
    <PasswordGate>
      <div className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 min-h-screen text-white" style={{ fontFamily: 'Lexend, sans-serif' }}>
        <div className="absolute inset-0 z-0 opacity-20" style={{ background: "url('/carnet-escudo.png') no-repeat center", backgroundSize: '700px' }}></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-80"></div>
        <div className="relative z-10 w-full flex flex-col items-center">
          <Head>
            <title>Registro de Asistencias</title>
            <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600&display=swap" rel="stylesheet"/>
          </Head>
          <motion.h1 className="text-4xl font-semibold mb-6 text-center" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Registro de Asistencias
          </motion.h1>
          <form onSubmit={handleRegistroAsistencia} className="mb-4 flex gap-2 w-full max-w-sm">
            <motion.input
              type="text"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              placeholder="Ingrese ID del estudiante"
              className="p-3 rounded-lg w-full bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ref={inputRef}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            />
            <motion.button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              Registrar
            </motion.button>
          </form>
          {mensaje && <motion.p className="mb-2 text-green-200 font-semibold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{mensaje}</motion.p>}
          {advertencia && <motion.p className="mb-2 text-yellow-300 font-semibold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>{advertencia}</motion.p>}
          {estudiante && (
            <div className="mt-6 flex items-center gap-6">
              {estudiante.foto && <motion.img src={estudiante.foto} alt={`Foto de ${estudiante.nombre}`} className="w-32 h-32 object-cover rounded-lg border-4 border-white shadow-lg" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }} />}
              <div>
                <motion.h2 className="text-2xl font-semibold" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  {estudiante.nombre}
                </motion.h2>
                <p className="text-lg text-gray-200">Grupo: {estudiante.grupo}</p>
              </div>
            </div>
          )}
          {ultimoRegistro && (
            <motion.button onClick={handleEliminarUltimoRegistro} className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg shadow-md mt-6 transition duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              Eliminar Último Registro
            </motion.button>
          )}
        </div>
      </div>
    </PasswordGate>
  );
}
