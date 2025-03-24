import React from 'react';
import { motion } from 'framer-motion';

// Componente de Login con animaciones y accesibilidad mejorada
const Login: React.FC = () => {
  return (
    // Contenedor del formulario con animación de entrada
    <motion.div
      initial={{ opacity: 0, y: -50 }} // Estado inicial: invisible y desplazado hacia arriba
      animate={{ opacity: 1, y: 0 }} // Estado final: visible y en su posición original
      transition={{ duration: 0.5 }} // Duración de la animación: 0.5 segundos
      className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
    >
      {/* Título del formulario */}
      <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Login</h2>
      <form>
        {/* Campo de Username con etiqueta para accesibilidad */}
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            placeholder="Username"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
        {/* Campo de Password con etiqueta para accesibilidad */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>
        {/* Botón de Login */}
        <button
          type="submit"
          className="w-full bg-primary-red text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          Login
        </button>
        {/* Botón de Go to Employees */}
        <button
          type="button"
          className="w-full mt-3 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors"
        >
          Go to Employees
        </button>
      </form>
    </motion.div>
  );
};

export default Login;