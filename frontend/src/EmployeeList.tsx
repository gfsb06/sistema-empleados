import React, { useState, useEffect } from 'react';

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtener el token de localStorage
        if (!token) {
          setMessage('No estás autenticado. Por favor, inicia sesión.');
          return;
        }

        const response = await fetch('http://localhost:8000/employees', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Incluir el token en el header
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setMessage('No hay empleados registrados.');
          } else {
            setEmployees(data);
            setMessage('');
          }
        } else {
          const errorData = await response.json();
          setMessage('Error al cargar empleados: ' + (errorData.detail || 'Unknown error'));
        }
      } catch (error) {
        setMessage('Error de red: No se pudo conectar al servidor');
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#2B628B' }}>Lista de Empleados</h1>
      {message ? (
        <p style={{ color: 'red' }}>{message}</p>
      ) : (
        <ul>
          {employees.map((employee) => (
            <li key={employee.id}>
              {employee.name} - {employee.email || 'Sin email'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EmployeeList;