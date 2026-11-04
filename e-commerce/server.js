import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// --- Mock Database ---
const BLACKLISTED_IPS = ['192.168.1.100', '10.0.0.55'];
const USERS = [
  { username: 'abi', password: 'abi1908', role: 'admin' },
  { username: 'raj', password: 'roddy123', role: 'customer' }
];

// --- LAYER 1: Firewall IP Filtering ---
app.use((req, res, next) => {
  const clientIp = req.headers['x-simulated-ip'] || req.ip;
  if (BLACKLISTED_IPS.includes(clientIp)) {
    console.log(`[FIREWALL] Blocked request from ${clientIp}`);
    return res.status(403).json({ error: 'Access Denied: IP Blocked by Firewall' });
  }
  next();
});

// --- LAYER 2 & 3: Sanitization and Authentication ---
app.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  // Layer 2: Sanitization (Server-side)
  const sanitizedUsername = username.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedPassword = password.replace(/[^a-zA-Z0-9]/g, '');

  if (username !== sanitizedUsername) console.log(`[SANITIZATION] Stripped invalid chars.`);

  // Layer 3: Authentication & RBAC
  const user = USERS.find(
    (u) => u.username === sanitizedUsername && u.password === sanitizedPassword
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Success', user: { username: user.username, role: user.role } });
});

app.listen(3000, () => {
  console.log('Backend Security Server running on http://localhost:3000');
});