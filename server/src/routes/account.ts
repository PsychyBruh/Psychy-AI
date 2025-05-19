import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from "speakeasy";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import User from '../models/User';

const router = express.Router();

// JWT auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (typeof decoded === 'string' || !('id' in decoded)) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userId = (decoded as any).id;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// POST /api/account/register
router.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) return res.status(409).json({ error: 'User exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, username, password: hash, isEmailVerified: false, twoFAEnabled: false, passkeys: [], sessions: [] });
  // TODO: Send verification email (implement email sending logic)
  res.status(201).json({ message: 'Registered. Please verify your email.' });
});

// POST /api/account/login
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;
  const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  // 2FA/passkey check (implement real logic)
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged in', user: { id: user._id, email: user.email, username: user.username } });
});

// POST /api/account/logout
router.post('/logout', requireAuth, (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// POST /api/account/resend-verification
router.post('/resend-verification', requireAuth, async (req, res) => {
  // TODO: Actually send email (implement email sending logic)
  res.json({ message: 'Verification email sent.' });
});

// POST /api/account/enable-2fa
router.post('/enable-2fa', requireAuth, async (req, res) => {
  const userId = req.userId;
  const secret = speakeasy.generateSecret({ length: 20 });
  await User.findByIdAndUpdate(userId, { twoFASecret: secret.base32 });
  res.json({ otpauth_url: secret.otpauth_url, base32: secret.base32 });
});

// POST /api/account/verify-2fa
router.post('/verify-2fa', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { token } = req.body;
  const user = await User.findById(userId);
  if (!user || !user.twoFASecret) return res.status(400).json({ verified: false });
  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: 'base32',
    token
  });
  if (verified) {
    user.twoFAEnabled = true;
    await user.save();
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});

// POST /api/account/passkey/register/options
router.post('/passkey/register/options', requireAuth, async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const options = generateRegistrationOptions({
    rpName: 'Psychy AI',
    rpID: req.hostname,
    userID: userId || '',
    userName: user.username || user.email,
  });
  // Store challenge in user doc for later verification
  user.passkeyChallenge = options.challenge;
  await user.save();
  res.json(options);
});

// POST /api/account/passkey/register/verify
router.post('/passkey/register/verify', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { attResp } = req.body;
  const user = await User.findById(userId);
  if (!user || !user.passkeyChallenge) return res.status(400).json({ error: 'No challenge' });
  const verification = await verifyRegistrationResponse({
    response: attResp,
    expectedChallenge: user.passkeyChallenge,
    expectedOrigin: req.headers.origin || '',
    expectedRPID: req.hostname,
  });
  if (verification.verified) {
    user.passkeys.push(attResp);
    user.passkeyChallenge = undefined;
    await user.save();
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});

// POST /api/account/passkey/authenticate/options
router.post('/passkey/authenticate/options', requireAuth, async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const options = generateAuthenticationOptions({
    userVerification: 'preferred',
    rpID: req.hostname,
  });
  user.passkeyChallenge = options.challenge;
  await user.save();
  res.json(options);
});

// POST /api/account/passkey/authenticate/verify
router.post('/passkey/authenticate/verify', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { assertionResp } = req.body;
  const user = await User.findById(userId);
  if (!user || !user.passkeyChallenge) return res.status(400).json({ error: 'No challenge' });
  // Find matching credential
  const authenticator = user.passkeys.find((pk) => pk.id === assertionResp.id);
  const verification = await verifyAuthenticationResponse({
    response: assertionResp,
    expectedChallenge: user.passkeyChallenge,
    expectedOrigin: req.headers.origin || '',
    expectedRPID: req.hostname,
    authenticator,
  });
  if (verification.verified) {
    user.passkeyChallenge = undefined;
    await user.save();
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});

// Data export endpoint
router.get('/export', requireAuth, async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).select('-password -twoFASecret');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Delete account endpoint
router.delete('/delete', requireAuth, async (req, res) => {
  const userId = req.userId;
  await User.findByIdAndDelete(userId);
  // Optionally: delete user chat sessions, etc.
  res.json({ success: true });
});

// Session/device management endpoint (list sessions)
router.get('/sessions', requireAuth, async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId).select('sessions');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user.sessions);
});

// Remove session/device endpoint
router.post('/sessions/remove', requireAuth, async (req, res) => {
  const userId = req.userId;
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Missing sessionId' });
  await User.findByIdAndUpdate(userId, { $pull: { sessions: { sessionId } } });
  res.json({ success: true });
});

export default router;
