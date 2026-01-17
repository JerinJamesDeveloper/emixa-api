const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Mock users database
const users = [
  {
    id: '1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    is_email_verified: true,
    created_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    email: 'user@example.com',
    first_name: 'Regular',
    last_name: 'User',
    password: 'User@123#',
    role: 'user',
    status: 'active',
    is_email_verified: true,
    created_at: '2024-01-01T00:00:00.000Z'
  }
];

// Simple login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Find user by email
  const user = users.find(u => u.email === email);
  
  // If user not found or password doesn't match
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Return user data (remove password from response)
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      message: 'Login successful'
    }
  });
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running',
    endpoints: {
      login: 'POST /login',
      users: 'GET /users'
    },
    test_users: [
      { email: 'admin@example.com', password: 'admin123', role: 'admin' },
      { email: 'user@example.com', password: 'user123', role: 'user' }
    ]
  });
});

// Optional: Get all users (for testing)
app.get('/users', (req, res) => {
  const usersWithoutPasswords = users.map(({ password, ...user }) => user);
  res.json(usersWithoutPasswords);
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('\n📝 Available endpoints:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   POST http://localhost:${PORT}/login`);
  console.log(`   GET  http://localhost:${PORT}/users`);
  console.log('\n🔑 Test credentials:');
  console.log('   Admin: email="admin@example.com", password="admin123"');
  console.log('   User:  email="user@example.com", password="user123"');
});