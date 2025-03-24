import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminPanel from './AdminPanel';

const App: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState('');
  const [duration, setDuration] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8000/employees', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(data => setEmployees(data))
        .catch(error => console.error('Error fetching employees:', error));
    }
  }, [token]);

  const handleLogTime = async () => {
    if (!token) {
      setMessage('Please log in first!');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/log-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: parseInt(userId), duration: parseInt(duration) }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUserId('');
        setDuration('');
      } else {
        setMessage('Failed to log time: ' + data.detail);
      }
    } catch (error) {
      setMessage('Network error: Could not connect to the server');
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-bold text-white mb-8">Sistema de Empleados</h1>
      {showLogin ? (
        <Login setToken={setToken} setShowLogin={setShowLogin} />
      ) : showAdmin ? (
        <AdminPanel setShowAdmin={setShowAdmin} />
      ) : (
        <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Lista de Empleados</h2>
          {employees.length === 0 ? (
            <p className="text-gray-600">No hay empleados registrados.</p>
          ) : (
            <ul className="space-y-2">
              {employees.map((employee) => (
                <li key={employee.id} className="p-2 bg-gray-50 rounded">
                  {employee.name || employee.username} ({employee.email})
                </li>
              ))}
            </ul>
          )}
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">Log Time</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              type="text"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={handleLogTime}
              className="w-full bg-secondary text-white p-2 rounded hover:bg-opacity-90 transition"
            >
              Log Time
            </button>
            {message && <p className="text-secondary">{message}</p>}
          </div>
        </div>
      )}
      <div className="mt-6 space-x-4">
        <button
          onClick={() => setShowLogin(!showLogin)}
          className="bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
        >
          {showLogin ? 'Go to Employees' : 'Go to Login'}
        </button>
        {!showLogin && (
          <button
            onClick={() => setShowAdmin(!showAdmin)}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-opacity-90 transition"
          >
            {showAdmin ? 'Go to Employees' : 'Go to Admin Panel'}
          </button>
        )}
      </div>
    </div>
  );
};

export default App;