import React from "react";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Head from "next/head";
import { usePassword } from "../contexts/PasswordContext";
import { clickSound, errorSound, registeredSound } from "../lib/sounds";

const PasswordGate = ({ children }) => {
  const { authenticated, login } = usePassword();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      clickSound.play();
      if (password === "mi-contraseña") {
        registeredSound.play();
        login();
      } else {
        setErrorMessage("Contraseña incorrecta.");
        errorSound.play();
        setPassword("");
      }
    },
    [password, login]
  );

  if (!authenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-blue-900 text-white"
        style={{ fontFamily: "Lexend, sans-serif" }}
      >
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;600&display=swap"
            rel="stylesheet"
          />
          <style jsx global>{`
            ::placeholder {
              font-family: "Lexend", sans-serif;
            }
          `}</style>
        </Head>

        {/* Logo del colegio */}
        <motion.img
          src="/carnet-escudo.png"
          alt="Logo del colegio"
          className="w-24 h-24 mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.form
          onSubmit={handleSubmit}
          className="bg-blue-800 p-8 rounded-lg shadow-lg flex flex-col w-80"
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.label
            htmlFor="password"
            className="block mb-4 text-xl font-semibold"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Ingresa la contraseña:
          </motion.label>

          <motion.input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            className="w-full px-4 py-2 rounded-md bg-blue-700 focus:outline-none mb-2 focus:ring-2 focus:ring-indigo-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />

          <motion.div
            className="h-5 mb-4 text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: errorMessage ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {errorMessage && errorMessage}
          </motion.div>

          <motion.button
            type="submit"
            className="w-full px-4 py-2 rounded-md bg-indigo-500 hover:bg-indigo-600 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Ingresar
          </motion.button>
        </motion.form>

        {/* Texto aclaratorio en párrafos */}
        <motion.div
          className="text-xs text-center mt-4 text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ fontFamily: "Lexend, sans-serif" }}
        >
          <p className="mb-2">
            Esta página es de uso exclusivo para el personal autorizado de la Institución Educativa Centenario.
          </p>
          <p>
            El acceso o uso indebido del sitio puede acarrear sanciones disciplinarias conforme a las normativas internas.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return children;
};

export default React.memo(PasswordGate);
