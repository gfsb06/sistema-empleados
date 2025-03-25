import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Componente de Login con animaciones y accesibilidad mejorada
const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de autenticación
    if (username === 'admin' && password === 'admin123') {
      setError('');
      navigate('/employees'); // Redirige a la página de empleados
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleGoToEmployees = () => {
    navigate('/employees'); // Redirige a la página de empleados sin autenticación
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-blue">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue text-gray-800"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-red text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Login
          </button>
          <button
            type="button"
            onClick={handleGoToEmployees}
            className="w-full mt-3 bg-gray-800 text-white p-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Go to Employees
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;