import React from 'react';

// Datos estáticos de empleados (simulados)
const mockEmployees = [
  { id: 1, name: 'Juan Pérez', email: 'juan.perez@example.com', position: 'Desarrollador' },
  { id: 2, name: 'María Gómez', email: 'maria.gomez@example.com', position: 'Diseñadora' },
  { id: 3, name: 'Carlos López', email: 'carlos.lopez@example.com', position: 'Gerente' },
];

// Componente para mostrar la lista de empleados
const EmployeeList: React.FC = () => {
  // Función para exportar el reporte como CSV
  const handleExportReport = () => {
    try {
      // Crear el contenido del CSV con codificación UTF-8
      const csvHeaders = 'id,name,email,position\n';
      const csvRows = mockEmployees
        .map((employee) => `${employee.id},${employee.name},${employee.email},${employee.position}`)
        .join('\n');
      const csvContent = `\ufeff${csvHeaders}${csvRows}`; // Añadir BOM para UTF-8

      // Crear un blob y un enlace para descargar el CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'employees-report.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar el reporte:', error);
      alert('No se pudo exportar el reporte');
    }
  };

  return (
    <div className="min-h-screen bg-primary-blue flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Lista de Empleados</h2>
        <button
          onClick={handleExportReport}
          className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors mb-4"
        >
          Exportar Reporte
        </button>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Nombre</th>
              <th className="border border-gray-300 p-2">Email</th>
              <th className="border border-gray-300 p-2">Posición</th>
            </tr>
          </thead>
          <tbody>
            {mockEmployees.map((employee) => (
              <tr key={employee.id}>
                <td className="border border-gray-300 p-2">{employee.id}</td>
                <td className="border border-gray-300 p-2">{employee.name}</td>
                <td className="border border-gray-300 p-2">{employee.email}</td>
                <td className="border border-gray-300 p-2">{employee.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;