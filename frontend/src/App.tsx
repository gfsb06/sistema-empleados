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
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2B628B' }}>Sistema de Empleados</h1>
      {showLogin ? (
        <Login setToken={setToken} setShowLogin={setShowLogin} />
      ) : showAdmin ? (
        <AdminPanel setShowAdmin={setShowAdmin} />
      ) : (
        <>
          <h2 style={{ color: '#D00003' }}>Lista de Empleados</h2>
          <ul>
            {employees.map((employee) => (
              <li key={employee.id}>
                {employee.name || employee.username} ({employee.email})
              </li>
            ))}
          </ul>
          {employees.length === 0 && <p>No hay empleados registrados.</p>}
          <h3 style={{ color: '#2B628B' }}>Log Time</h3>
          <input
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
          <input
            type="text"
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ margin: '10px 0', padding: '5px' }}
          />
          <button onClick={handleLogTime} style={{ margin: '10px 0', padding: '5px' }}>
            Log Time
          </button>
          <p>{message}</p>
        </>
      )}
      <button onClick={() => setShowLogin(!showLogin)} style={{ margin: '10px 0', padding: '5px' }}>
        {showLogin ? 'Go to Employees' : 'Go to Login'}
      </button>
      {!showLogin && (
        <button onClick={() => setShowAdmin(!showAdmin)} style={{ margin: '10px 0', padding: '5px' }}>
          {showAdmin ? 'Go to Employees' : 'Go to Admin Panel'}
        </button>
      )}
    </div>
  );
};

export default App;