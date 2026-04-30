import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import { serverError } from '../utils/errorFormat';
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

console.log('Auth Router initialized:');
console.log('  JWT_SECRET:', JWT_SECRET ? '✓ SET' : '✗ NOT SET');
console.log('  GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✓ SET' : '✗ NOT SET');

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true }
    });
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json(serverError(error, 'Signup failed - email may already exist'));
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

router.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Google token is required' });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json(serverError(new Error('Google OAuth not configured'), 'Google OAuth not configured on server'));
  }

  try {
    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name } = payload;

    // Find or create user
    let user = await prisma.user.findUnique({ 
      where: { email },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          password: '', // Google users don't have password
        },
        select: { id: true, email: true, name: true }
      });
    }

    // Return JWT (same format as email/password login)
    const jwtToken = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    console.error('Google OAuth error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clientId: GOOGLE_CLIENT_ID ? '***set***' : '***NOT SET***'
    });
    res.status(500).json(serverError(error, 'Google authentication failed'));
  }
});

router.get('/me', authenticateToken, async (req: any, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

export default router;