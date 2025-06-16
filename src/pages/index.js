import Link from 'next/link';
import { motion } from 'framer-motion';
import Head from 'next/head';
import PasswordGate from '../components/PasswordGate';
import { clickSound } from '../lib/sounds';

export default function Home() {
  return (
    <PasswordGate>
      <div
        className="relative flex flex-col items-center justify-center p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 min-h-screen text-white"
        style={{ fontFamily: 'Lexend, sans-serif' }}
      >
        {/* Fondo: silueta del escudo (más pequeño) */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            background: "url('/carnet-escudo.png') no-repeat center",
            backgroundSize: '700px'
          }}
        ></div>

        {/* Capa de gradiente para mantener el estilo */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-80"></div>

        {/* Contenido principal centrado */}
        <div className="relative z-10 w-full flex flex-col items-center">
          <Head>
          <link rel="icon" href="/favicon.ico" />
            <title>Menú Principal</title>
            <link
              href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600&display=swap"
              rel="stylesheet"
            />
          </Head>

          <motion.h1
            className="text-4xl font-semibold mb-8 text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Menú Principal
          </motion.h1>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mb-4"
          >
            <Link
              href="/asistencia"
              onClick={() => clickSound.play()}
              className="block px-6 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-lg text-center transition"
            >
              Registro de Asistencias
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md mb-4"
          >
            <Link
              href="/carnet"
              onClick={() => clickSound.play()}
              className="block px-6 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-lg text-center transition"
            >
              Carnetización
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
          >
            <Link
              href="/gestion"
              onClick={() => clickSound.play()}
              className="block px-6 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-lg text-center transition"
            >
              Gestión de Estudiantes
            </Link>
          </motion.div>
        </div>
      </div>
    </PasswordGate>
  );
}
