const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// Middleware
app.use(bodyParser.json());

// Mock database - users with admin and user roles
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    password: 'admin123', // In real app, use hashed passwords
    role: 'admin',
    status: 'active',
    is_email_verified: true,
    is_phone_verified: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    last_login_at: null
  },
  {
    id: '2',
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    password: 'user123',
    role: 'user',
    status: 'active',
    is_email_verified: true,
    is_phone_verified: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    last_login_at: null
  }
];

// Login endpoint
app.post('api/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password (in real app, use bcrypt to compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Update last login time
    user.last_login_at = new Date().toISOString();

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response matching your UserModel structure
    const userResponse = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      avatar_url: user.avatar_url || null,
      phone_number: user.phone_number || null,
      is_email_verified: user.is_email_verified,
      is_phone_verified: user.is_phone_verified,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login_at: user.last_login_at
    };

    // Return success response matching your Dart client expectation
    res.json({
      success: true,
      data: {
        user: userResponse,
        token: token,
        expires_in: 86400 // 24 hours in seconds
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Optional: Add a protected test endpoint
app.get('/protected', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      message: `Welcome ${decoded.email}!`,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`  POST http://localhost:${PORT}/login`);
  console.log(`  GET  http://localhost:${PORT}/protected (requires Bearer token)`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log('\nTest credentials:');
  console.log('  Admin: admin@example.com / admin123');
  console.log('  User:  user@example.com / user123');
});

// Export for testing
module.exports = app;