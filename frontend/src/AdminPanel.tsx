import React, { useState, useEffect } from 'react';

const AdminPanel: React.FC<{ setShowAdmin: (show: boolean) => void }> = ({ setShowAdmin }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [newEmployee, setNewEmployee] = useState({ username: '', password: '', email: '' });
  const [updateEmployee, setUpdateEmployee] = useState({ id: 0, username: '', password: '', email: '' });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const token = localStorage.getItem('token');

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

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('No estás autenticado.');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/admin/add-employee', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmployee),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setNewEmployee({ username: '', password: '', email: '' });
        fetch('http://localhost:8000/employees', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(data => setEmployees(data));
      } else {
        setMessage('Error: ' + (data.detail || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Error de red');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage('No estás autenticado.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/admin/update-employee/${updateEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: updateEmployee.username, password: updateEmployee.password, email: updateEmployee.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setUpdateEmployee({ id: 0, username: '', password: '', email: '' });
        setIsEditing(false);
        fetch('http://localhost:8000/employees', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(data => setEmployees(data));
      } else {
        setMessage('Error: ' + (data.detail || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Error de red');
    }
  };

  const handleDeleteEmployee = async (id: number) => {
    if (!token) {
      setMessage('No estás autenticado.');
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/admin/delete-employee/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        fetch('http://localhost:8000/employees', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(response => response.json())
          .then(data => setEmployees(data));
      } else {
        setMessage('Error: ' + (data.detail || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Error de red');
    }
  };

  const startEditing = (employee: any) => {
    setIsEditing(true);
    setUpdateEmployee({ id: employee.id, username: employee.name || employee.username, password: '', email: employee.email });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2B628B' }}>Panel de Administración</h1>
      <form onSubmit={handleAddEmployee} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Username"
          value={newEmployee.username}
          onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
          style={{ margin: '5px', padding: '5px' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newEmployee.password}
          onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
          style={{ margin: '5px', padding: '5px' }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmployee.email}
          onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
          style={{ margin: '5px', padding: '5px' }}
        />
        <button type="submit" style={{ margin: '5px', padding: '5px' }}>Agregar Empleado</button>
      </form>
      {isEditing && (
        <form onSubmit={handleUpdateEmployee} style={{ marginBottom: '20px' }}>
          <input
            type="number"
            placeholder="ID"
            value={updateEmployee.id}
            onChange={(e) => setUpdateEmployee({ ...updateEmployee, id: parseInt(e.target.value) })}
            style={{ margin: '5px', padding: '5px' }}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={updateEmployee.username}
            onChange={(e) => setUpdateEmployee({ ...updateEmployee, username: e.target.value })}
            style={{ margin: '5px', padding: '5px' }}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={updateEmployee.password}
            onChange={(e) => setUpdateEmployee({ ...updateEmployee, password: e.target.value })}
            style={{ margin: '5px', padding: '5px' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={updateEmployee.email}
            onChange={(e) => setUpdateEmployee({ ...updateEmployee, email: e.target.value })}
            style={{ margin: '5px', padding: '5px' }}
          />
          <button type="submit" style={{ margin: '5px', padding: '5px' }}>Actualizar Empleado</button>
          <button onClick={() => setIsEditing(false)} style={{ margin: '5px', padding: '5px' }}>Cancelar</button>
        </form>
      )}
      <h2 style={{ color: '#D00003' }}>Lista de Empleados</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <ul>
        {employees.map((employee) => (
          <li key={employee.id}>
            {employee.name || employee.username} ({employee.email})
            <button onClick={() => startEditing(employee)} style={{ margin: '5px', padding: '5px' }}>Editar</button>
            <button onClick={() => handleDeleteEmployee(employee.id)} style={{ margin: '5px', padding: '5px' }}>Eliminar</button>
          </li>
        ))}
      </ul>
      <button onClick={() => setShowAdmin(false)} style={{ margin: '10px 0', padding: '5px' }}>Go to Employees</button>
    </div>
  );
};

export default AdminPanel;