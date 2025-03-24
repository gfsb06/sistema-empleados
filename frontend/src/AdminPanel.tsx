import React, { useState, useEffect } from 'react';

interface AdminPanelProps {
  setShowAdmin: (show: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ setShowAdmin }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://localhost:8000/employees', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(response => response.json())
        .then(data => setEmployees(data))
        .catch(error => console.error('Error fetching employees:', error));
    }
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please log in first!');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email, username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees([...employees, data]);
        setName('');
        setEmail('');
        setUsername('');
        setPassword('');
        setMessage('Employee added successfully!');
      } else {
        setMessage('Failed to add employee: ' + data.detail);
      }
    } catch (error) {
      setMessage('Network error: Could not connect to the server');
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Admin Panel</h2>
      <form onSubmit={handleAddEmployee} className="space-y-4 mb-6">
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
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
          Add Employee
        </button>
        {message && <p className="text-secondary text-center">{message}</p>}
      </form>
      <button
        onClick={() => setShowAdmin(false)}
        className="w-full bg-accent text-white p-2 rounded hover:bg-opacity-90 transition"
      >
        Go to Employees
      </button>
    </div>
  );
};

export default AdminPanel;