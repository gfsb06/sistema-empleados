import React, { useState } from 'react';

interface LoginProps {
  setToken: (token: string | null) => void;
  setShowLogin: (show: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setToken, setShowLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        setShowLogin(false);
        setMessage('');
      } else {
        setMessage(data.detail || 'Login failed');
      }
    } catch (error) {
      setMessage('Network error: Could not connect to the server');
    }
  };

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-secondary text-white p-2 rounded hover:bg-opacity-90 transition"
        >
          Login
        </button>
        {message && <p className="text-secondary text-center">{message}</p>}
      </form>
      <button
        onClick={() => setShowLogin(false)}
        className="mt-4 w-full bg-accent text-white p-2 rounded hover:bg-opacity-90 transition"
      >
        Go to Employees
      </button>
    </div>
  );
};

export default Login;