import React, { useState } from 'react';

const Login: React.FC<{ setToken: (token: string | null) => void; setShowLogin: (show: boolean) => void }> = ({ setToken, setShowLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        setToken(data.access_token);
        setShowLogin(false);
        setMessage('Login successful!');
      } else {
        setMessage('Login failed: ' + (data.detail || 'Unknown error'));
      }
    } catch (error) {
      setMessage('Network error: Could not connect to the server');
    }
  };

  return (
    <div>
      <h1 style={{ color: '#2B628B' }}>Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ margin: '10px 0', padding: '5px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ margin: '10px 0', padding: '5px' }}
      />
      <button onClick={handleLogin} style={{ margin: '10px 0', padding: '5px' }}>Login</button>
      <p>{message}</p>
    </div>
  );
};

export default Login;