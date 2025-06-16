import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import Head from 'next/head';
import PasswordGate from '../components/PasswordGate';
import { clickSound, errorSound, registeredSound } from '../lib/sounds';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function GestionEstudiantes() {
  const [id, setId] = useState('');
  const [estudiante, setEstudiante] = useState(null);
  const [nuevoGrupo, setNuevoGrupo] = useState('');
  const [nuevaFoto, setNuevaFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [correoElectronico, setCorreoElectronico] = useState(''); // Estado para el correo
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);

  const buscarEstudiante = async () => {
    clickSound.play();
    setError('');
    setMensaje('');
    setConfirmarEliminar(false);
    setEstudiante(null);

    if (!id.trim()) {
      setError('❌ Ingrese un ID válido.');
      errorSound.play();
      return;
    }

    const { data, error } = await supabase
      .from('estudiantes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      setError('❌ No se encontró ningún estudiante con ese ID.');
      errorSound.play();
    } else {
      setEstudiante(data);
      setNuevoGrupo(data.grupo);
      setFotoPreview(data.foto);
      setCorreoElectronico(data.correo_electronico); // Se asigna el correo obtenido
    }
  };

  const manejarCambioFoto = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNuevaFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    } else {
      setError('❌ El archivo seleccionado no es una imagen válida.');
      errorSound.play();
    }
  };

  const guardarCambios = async () => {
    clickSound.play();
    if (!estudiante) return;
    setCargando(true);
    setMensaje('');
    setError('');

    let urlFoto = estudiante.foto;
    if (nuevaFoto) {
      const formData = new FormData();
      formData.append('file', nuevaFoto);
      formData.append('upload_preset', 'velvet_upload');

      try {
        const response = await fetch('https://api.cloudinary.com/v1_1/dcp5adfbg/image/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.secure_url) {
          urlFoto = data.secure_url;
        } else {
          throw new Error('No se pudo obtener la URL de la imagen.');
        }
      } catch (error) {
        setError('❌ Error al subir la imagen.');
        errorSound.play();
        setCargando(false);
        return;
      }
    }

    // Actualizamos también el correo_electronico
    const { error } = await supabase
      .from('estudiantes')
      .update({ grupo: nuevoGrupo, foto: urlFoto, correo_electronico: correoElectronico })
      .eq('id', estudiante.id);

    if (error) {
      setError('❌ Error al guardar los cambios.');
      errorSound.play();
    } else {
      setMensaje('✅ Cambios guardados exitosamente.');
      registeredSound.play();
      setEstudiante({ ...estudiante, grupo: nuevoGrupo, foto: urlFoto, correo_electronico: correoElectronico });
      setNuevaFoto(null);
      setFotoPreview(urlFoto);
    }
    setCargando(false);
  };

  const eliminarEstudiante = async () => {
    clickSound.play();
    if (!confirmarEliminar) {
      setConfirmarEliminar(true);
      return;
    }

    setCargando(true);
    setMensaje('');
    setError('');

    // Eliminar la imagen de Cloudinary a través de una API en Next.js
    if (estudiante.foto) {
      try {
        const response = await fetch('/api/eliminarFoto', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: estudiante.foto }),
        });
        const data = await response.json();
        if (!data.success) {
          console.error('Error eliminando la imagen en Cloudinary:', data.error);
        }
      } catch (error) {
        console.error('Error en la solicitud de eliminación de imagen:', error);
      }
    }

    const { error } = await supabase
      .from('estudiantes')
      .delete()
      .eq('id', estudiante.id);
    if (error) {
      setError('❌ Error al eliminar el estudiante.');
      errorSound.play();
    } else {
      setMensaje('✅ Estudiante eliminado correctamente.');
      registeredSound.play();
      setEstudiante(null);
      setId('');
    }
    setCargando(false);
    setConfirmarEliminar(false);
  };

  return (
    <PasswordGate>
      <>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600&display=swap"
            rel="stylesheet"
          />
        </Head>

        {/* Contenedor principal con el mismo fondo que Menú Principal */}
        <div
          className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 min-h-screen text-white"
          style={{ fontFamily: 'Lexend, sans-serif' }}
        >
          {/* Fondo: silueta del escudo */}
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              background: "url('/carnet-escudo.png') no-repeat center",
              backgroundSize: '700px'
            }}
          ></div>

          {/* Capa de gradiente adicional para oscurecer */}
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-80"></div>

          {/* Contenido principal */}
          <div className="relative z-10 w-full flex flex-col items-center">
            <motion.h1
              className="text-3xl font-semibold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Gestión de Estudiantes
            </motion.h1>

            <motion.div
              className="w-full max-w-md mb-6"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.input
                type="text"
                placeholder="Ingrese ID del estudiante"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-black placeholder-gray-500 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                style={{ fontFamily: 'Lexend, sans-serif' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              />
              <motion.button
                onClick={buscarEstudiante}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md text-lg transition duration-300"
                style={{ fontFamily: 'Lexend, sans-serif' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Buscar
              </motion.button>
            </motion.div>

            {error && (
              <motion.p
                className="text-red-400 mb-4"
                style={{ fontFamily: 'Lexend, sans-serif' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {error}
              </motion.p>
            )}

            {mensaje && (
              <motion.p
                className="text-green-400 mb-4"
                style={{ fontFamily: 'Lexend, sans-serif' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {mensaje}
              </motion.p>
            )}

            {estudiante && (
              <motion.div
                className="bg-white text-black p-4 rounded-lg shadow-md w-full max-w-md"
                style={{ fontFamily: 'Lexend, sans-serif' }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-2">
                  <strong>ID:</strong> {estudiante.id}
                </p>
                <p className="mb-2">
                  <strong>Nombre:</strong> {estudiante.nombre}
                </p>
                <p className="mb-2">
                  <strong>Grupo:</strong>{' '}
                  <motion.input
                    type="text"
                    value={nuevoGrupo}
                    onChange={(e) => setNuevoGrupo(e.target.value)}
                    className="text-black border rounded px-2"
                    style={{ fontFamily: 'Lexend, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </p>
                {/* Campo para editar el correo electrónico */}
                <p className="mb-2">
                  <strong>Correo electrónico:</strong>{' '}
                  <motion.input
                    type="email"
                    value={correoElectronico}
                    onChange={(e) => setCorreoElectronico(e.target.value)}
                    className="text-black border rounded px-2"
                    style={{ fontFamily: 'Lexend, sans-serif' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                </p>
                <motion.img
                  src={fotoPreview}
                  alt="Foto del estudiante"
                  className="w-32 h-32 mt-4 rounded-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.input
                  type="file"
                  accept="image/*"
                  onChange={manejarCambioFoto}
                  className="mt-2"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                />
                <motion.button
                  onClick={guardarCambios}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md text-lg transition duration-300"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Guardar
                </motion.button>
                <motion.button
                  onClick={eliminarEstudiante}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md text-lg transition duration-300"
                  style={{ fontFamily: 'Lexend, sans-serif' }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {confirmarEliminar ? '¿Seguro? Presiona de nuevo' : 'Eliminar'}
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </>
    </PasswordGate>
  );
}
