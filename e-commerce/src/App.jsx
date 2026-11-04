import React, { useState } from 'react';
import './App.css';

function App() {
  const [simulatedIp, setSimulatedIp] = useState('192.168.1.10');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [sanitizationAlert, setSanitizationAlert] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Layer 2: Frontend Visual Sanitization
  const handleSanitizedInput = (e, setter) => {
    const rawValue = e.target.value;
    const sanitizedValue = rawValue.replace(/[^a-zA-Z0-9]/g, '');
    
    if (rawValue !== sanitizedValue) {
      setSanitizationAlert(true);
      setTimeout(() => setSanitizationAlert(false), 3000);
    }
    setter(sanitizedValue);
    setAuthError('');
  };

  // Layer 3: Connect to Backend
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-simulated-ip': simulatedIp // Sends the IP to test the backend firewall
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        setLoggedInUser(data.user);
      } else {
        setAuthError(data.error); // Will show "Access Denied" or "Invalid credentials"
      }
    } catch (err) {
      setAuthError('Cannot connect to server. Is server.js running?');
    }
  };

  // --- Views ---
  if (loggedInUser) {
    return (
      <div className="dashboard-container">
        <div className="card">
          <span className="role-badge">{loggedInUser.role}</span>
          <h2>Welcome, {loggedInUser.username}!</h2>
          <div className="alert alert-success">Backend Authentication Successful.</div>
          <button className="logout-btn" onClick={() => setLoggedInUser(null)}>Log Out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="firewall-status">
        <label>Simulate Current IP Address:</label>
        <select value={simulatedIp} onChange={(e) => setSimulatedIp(e.target.value)} style={{marginLeft: '10px'}}>
          <option value="192.168.1.10">192.168.1.10 (Safe IP)</option>
          <option value="192.168.1.100">192.168.1.100 (Blacklisted)</option>
        </select>
      </div>

      <div className="card">
        <h2>System Login</h2>
        {sanitizationAlert && <div className="alert alert-warning">Special characters stripped automatically.</div>}
        {authError && <div className="alert alert-error">{authError}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input type="text" value={username} onChange={(e) => handleSanitizedInput(e, setUsername)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => handleSanitizedInput(e, setPassword)} required />
          </div>
          <button type="submit">Authenticate</button>
        </form>
      </div>
    </div>
  );
}

export default App;