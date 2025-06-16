import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { motion } from 'framer-motion';
import Head from 'next/head';
import PasswordGate from '../components/PasswordGate';
import { clickSound, errorSound, registeredSound } from '../lib/sounds';

export default function RegistroCarnet() {
  const [id, setId] = useState('');
  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState(''); // Nuevo estado para el correo
  const [foto, setFoto] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [estudiante, setEstudiante] = useState(null);
  const [registrado, setRegistrado] = useState(false);

  // Función para manejar el cambio de foto
  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFoto(file);
    }
  };

  // Función para registrar al estudiante
  const handleRegistrar = async () => {
    clickSound.play(); // Sonido de clic
    if (!id || !nombre || !grupo || !foto || !correoElectronico) {  // Se incluye la validación del correo
      setMensaje('❌ Todos los campos son obligatorios.');
      errorSound.play();
      return;
    }

    // Subir la foto a Cloudinary
    const data = new FormData();
    data.append('file', foto);
    data.append('upload_preset', 'velvet_upload');
    data.append('cloud_name', 'dcp5adfbg');

    const response = await fetch('https://api.cloudinary.com/v1_1/dcp5adfbg/image/upload', {
      method: 'POST',
      body: data,
    });
    const result = await response.json();
    const cloudinaryUrl = result.secure_url;

    // Verificar si el estudiante ya está registrado
    const { data: estudianteData, error } = await supabase
      .from('estudiantes')
      .select('id')
      .eq('id', id)
      .single();

    if (estudianteData) {
      setMensaje('❌ El estudiante ya está registrado.');
      errorSound.play();
      return;
    }

    // Registrar al estudiante, incluyendo el correo electrónico
    const { error: insertError } = await supabase.from('estudiantes').insert([
      {
        id,
        nombre,
        grupo,
        foto: cloudinaryUrl,
        correo_electronico: correoElectronico, // Se agrega la columna del correo
      },
    ]);

    if (insertError) {
      setMensaje('❌ Error al registrar al estudiante.');
      errorSound.play();
      return;
    }

    setMensaje(`✅ Estudiante ${nombre} registrado exitosamente.`);
    registeredSound.play();
    setEstudiante({ id, nombre, grupo, foto: cloudinaryUrl, correo_electronico: correoElectronico });
    setRegistrado(true);
  };

  // Función para generar el PDF
  const generarPDF = async () => {
    clickSound.play();
    if (!id || !nombre || !grupo || !foto || !correoElectronico) {
      setMensaje('❌ Todos los campos son obligatorios.');
      errorSound.play();
      return;
    }

    const doc = new jsPDF({ unit: 'mm', format: [55, 85] });
    doc.setFont('Helvetica', 'normal');

    const anversoRef = document.getElementById('anverso');
    const reversoRef = document.getElementById('reverso');

    // Captura del anverso
    const anversoCanvas = await html2canvas(anversoRef, { scale: 2, useCORS: true });
    const anversoImg = anversoCanvas.toDataURL('image/png');
    doc.addImage(anversoImg, 'PNG', 0, 0, 55, 85);

    // Captura del reverso
    doc.addPage();
    const reversoCanvas = await html2canvas(reversoRef, { scale: 2, useCORS: true });
    const reversoImg = reversoCanvas.toDataURL('image/png');
    doc.addImage(reversoImg, 'PNG', 0, 0, 55, 85);

    doc.save(`Carnet_${id}.pdf`);
    setMensaje('✅⚠️ PDF generado, asegúrate de tener el estudiante registrado.');
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

        <div
          className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 min-h-screen text-white"
          style={{ fontFamily: 'Lexend, sans-serif' }}
        >
          <div
            className="absolute inset-0 z-0 opacity-20"
            style={{
              background: "url('/carnet-escudo.png') no-repeat center",
              backgroundSize: '700px',
            }}
          ></div>

          <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-80"></div>

          <div className="relative z-10 w-full flex flex-col items-center">
            <motion.h1
              className="text-4xl font-semibold mb-6 text-white"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Registro de Nuevo Estudiante
            </motion.h1>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
              <motion.input
                type="text"
                placeholder="ID del estudiante"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full p-3 border rounded-lg text-black"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              />

              <motion.input
                type="text"
                placeholder="Nombre del estudiante"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full p-3 border rounded-lg text-black"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              />

              <motion.input
                type="text"
                placeholder="Grupo"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                className="w-full p-3 border rounded-lg text-black"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              />

              {/* Nuevo campo para el correo electrónico */}
              <motion.input
                type="email"
                placeholder="Correo electrónico"
                value={correoElectronico}
                onChange={(e) => setCorreoElectronico(e.target.value)}
                className="w-full p-3 border rounded-lg text-black"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              />

              <motion.input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="w-full p-3 border rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              />

              <motion.button
                onClick={handleRegistrar}
                className="w-full p-3 bg-indigo-600 text-white rounded-lg mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                Registrar Estudiante
              </motion.button>

              <motion.button
                onClick={generarPDF}
                className="w-full p-3 bg-orange-600 text-white rounded-lg mt-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                Exportar Carnet a PDF
              </motion.button>

              {mensaje && (
                <motion.p
                  className="text-sm text-gray-700 mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mensaje}
                </motion.p>
              )}
            </div>

            <div className="mt-8 flex space-x-8">
              <div
                id="anverso"
                className="w-[220px] h-[340px] bg-white rounded-xl shadow-lg relative flex flex-col items-center justify-start p-4 text-center"
                style={{ backgroundImage: "url('/carnet-fondo.png')", backgroundSize: 'cover' }}
              >
                <img src="/carnet-escudo.png" alt="Escudo" className="w-16 h-16 mb-2" />
                {foto && (
                  <img
                    src={URL.createObjectURL(foto)}
                    alt="Foto del estudiante"
                    className="w-28 h-28 rounded-lg border border-gray-400 mb-2"
                  />
                )}
                <div className="mt-2">
                  <p className="text-lg font-bold text-black">{nombre}</p>
                  <p className="text-md text-black">ID: {id}</p>
                </div>
              </div>

              <div
                id="reverso"
                className="w-[220px] h-[340px] bg-white rounded-xl shadow-lg flex flex-col items-center justify-center p-4 text-center"
                style={{ backgroundImage: "url('/carnet-fondo.png')", backgroundSize: 'cover' }}
              >
                <div className="p-2 bg-white rounded-lg">
                  <QRCodeCanvas value={id} size={100} className="mb-2" />
                </div>
                <p className="text-xs text-black px-4 mt-2">
                  Este carnet es de uso exclusivo por el estudiante registrado para utilizar en la Institución Educativa Centenario. Su uso indebido puede acarrear sanciones disciplinarias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    </PasswordGate>
  );
}
