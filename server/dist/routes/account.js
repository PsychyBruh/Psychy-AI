"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const speakeasy_1 = __importDefault(require("speakeasy"));
const server_1 = require("@simplewebauthn/server");
const router = express_1.default.Router();
// In-memory user store for demo (replace with MongoDB in production)
const users = [];
// In-memory passkey store for demo (replace with DB in production)
const passkeys = [];
// POST /api/account/register
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password)
        return res.status(400).json({ error: 'Missing fields' });
    if (users.find(u => u.email === email || u.username === username))
        return res.status(409).json({ error: 'User exists' });
    const hash = await bcrypt_1.default.hash(password, 10);
    const user = { id: (0, uuid_1.v4)(), email, username, password: hash, verified: false };
    users.push(user);
    // TODO: Send verification email
    res.status(201).json({ message: 'Registered. Please verify your email.' });
});
// POST /api/account/login
router.post('/login', async (req, res) => {
    const { emailOrUsername, password } = req.body;
    const user = users.find(u => u.email === emailOrUsername || u.username === emailOrUsername);
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt_1.default.compare(password, user.password);
    if (!valid)
        return res.status(401).json({ error: 'Invalid credentials' });
    // TODO: 2FA/passkey check
    const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    res.json({ message: 'Logged in', user: { id: user.id, email: user.email, username: user.username } });
});
// POST /api/account/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});
// POST /api/account/resend-verification
router.post('/resend-verification', (req, res) => {
    // TODO: Actually send email
    res.json({ message: 'Verification email sent.' });
});
// POST /api/account/enable-2fa
router.post('/enable-2fa', (req, res) => {
    // In a real app, associate secret with user in DB
    const secret = speakeasy_1.default.generateSecret({ length: 20 });
    res.json({ otpauth_url: secret.otpauth_url, base32: secret.base32 });
});
// POST /api/account/verify-2fa
router.post('/verify-2fa', (req, res) => {
    const { token, secret } = req.body;
    const verified = speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32',
        token
    });
    if (verified) {
        res.json({ verified: true });
    }
    else {
        res.status(400).json({ verified: false });
    }
});
// POST /api/account/passkey/register/options
router.post('/passkey/register/options', (req, res) => {
    const { username } = req.body;
    const options = (0, server_1.generateRegistrationOptions)({
        rpName: 'Psychy AI',
        userID: username,
        userName: username,
    });
    res.json(options);
});
// POST /api/account/passkey/register/verify
router.post('/passkey/register/verify', (req, res) => {
    const { attResp, username } = req.body;
    // In production, fetch expectedChallenge from DB
    const verification = (0, server_1.verifyRegistrationResponse)({
        response: attResp,
        expectedChallenge: attResp.response.clientDataJSON, // Simplified for demo
        expectedOrigin: req.headers.origin,
        expectedRPID: req.hostname,
    });
    if (verification.verified) {
        passkeys.push({ username, credential: attResp });
        res.json({ verified: true });
    }
    else {
        res.status(400).json({ verified: false });
    }
});
// POST /api/account/passkey/authenticate/options
router.post('/passkey/authenticate/options', (req, res) => {
    const { username } = req.body;
    const options = (0, server_1.generateAuthenticationOptions)({
        userVerification: 'preferred',
    });
    res.json(options);
});
// POST /api/account/passkey/authenticate/verify
router.post('/passkey/authenticate/verify', (req, res) => {
    const { assertionResp, username } = req.body;
    // In production, fetch credential from DB
    const verification = (0, server_1.verifyAuthenticationResponse)({
        response: assertionResp,
        expectedChallenge: assertionResp.response.clientDataJSON, // Simplified for demo
        expectedOrigin: req.headers.origin,
        expectedRPID: req.hostname,
        authenticator: passkeys.find(p => p.username === username)?.credential,
    });
    if (verification.verified) {
        res.json({ verified: true });
    }
    else {
        res.status(400).json({ verified: false });
    }
});
exports.default = router;
