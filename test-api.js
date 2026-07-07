import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "iskcon_juhu_jwt_secret";

async function run() {
  // Generate a token for userId = 2
  const token = jwt.sign(
    { userId: 2, username: 'rahulkumar86920@gmail.com', role: 'user' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  console.log('Generated Token:', token);
  
  try {
    const res = await fetch('http://localhost:5001/api/user/donations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
  } catch (err) {
    console.error('Error fetching API:', err);
  }
}

run();
