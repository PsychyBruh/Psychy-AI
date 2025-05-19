// src/app/account/page.tsx
import React, { useState } from "react";
import axios from "axios";

const AccountPage: React.FC = () => {
  // 2FA state
  const [twoFASecret, setTwoFASecret] = useState<string | null>(null);
  const [twoFAQr, setTwoFAQr] = useState<string | null>(null);
  const [twoFAToken, setTwoFAToken] = useState("");
  const [twoFAStatus, setTwoFAStatus] = useState<string | null>(null);
  // Passkey state
  const [passkeyStatus, setPasskeyStatus] = useState<string | null>(null);

  // Enable 2FA
  const handleEnable2FA = async () => {
    setTwoFAStatus(null);
    const res = await axios.post("/api/account/enable-2fa");
    const data = res.data as any;
    setTwoFASecret(data.base32);
    setTwoFAQr(data.otpauth_url);
  };
  // Verify 2FA
  const handleVerify2FA = async () => {
    setTwoFAStatus(null);
    try {
      await axios.post("/api/account/verify-2fa", { token: twoFAToken, secret: twoFASecret });
      setTwoFAStatus("2FA enabled!");
    } catch {
      setTwoFAStatus("Invalid code.");
    }
  };
  // Register Passkey (WebAuthn)
  const handleRegisterPasskey = async () => {
    setPasskeyStatus(null);
    try {
      const { data: options } = await axios.post("/api/account/passkey/register/options", { username: "psychyuser" });
      // @ts-ignore
      const cred = await navigator.credentials.create({ publicKey: options });
      await axios.post("/api/account/passkey/register/verify", { attResp: cred, username: "psychyuser" });
      setPasskeyStatus("Passkey registered!");
    } catch {
      setPasskeyStatus("Passkey registration failed.");
    }
  };
  // Session management and security activity (demo data)
  const [sessionsList] = useState([
    { id: 'sess1', device: 'Windows PC', location: 'New York, USA', lastActive: '2025-05-16 10:00' },
    { id: 'sess2', device: 'iPhone', location: 'San Francisco, USA', lastActive: '2025-05-15 22:30' },
  ]);
  const [activityList] = useState([
    { event: 'Login', time: '2025-05-16 10:00', ip: '192.168.1.2' },
    { event: '2FA Enabled', time: '2025-05-15 21:00', ip: '192.168.1.2' },
    { event: 'Passkey Registered', time: '2025-05-15 20:45', ip: '192.168.1.2' },
  ]);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Account Management</h1>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Profile Information</h2>
        <form className="flex flex-col gap-4">
          <label>Email <input type="email" className="input" disabled value="user@example.com" /></label>
          <label>Username <input type="text" className="input" disabled value="psychyuser" /></label>
          <label>Name <input type="text" className="input" value="" /></label>
          <label>Profile Picture <input type="file" className="input" /></label>
          <label>Bio <textarea className="input" /></label>
          <label>Social Links <input type="text" className="input" placeholder="@twitter, github, ..." /></label>
          <button className="bg-psychy-green text-white px-4 py-2 rounded font-semibold w-fit">Save Changes</button>
        </form>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Account Actions</h2>
        <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded mr-2">Logout</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">Delete Account</button>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Security Settings</h2>
        <button className="bg-psychy-green text-white px-4 py-2 rounded mb-2" onClick={handleEnable2FA}>Enable 2FA</button>
        {twoFAQr && (
          <div className="mb-2">
            <div>Scan QR in Authenticator app:</div>
            <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(twoFAQr)}&size=150x150`} alt="2FA QR" />
            <input className="input mt-2" placeholder="Enter 2FA code" value={twoFAToken} onChange={e => setTwoFAToken(e.target.value)} />
            <button className="ml-2 bg-psychy-green text-white px-2 py-1 rounded" onClick={handleVerify2FA}>Verify</button>
            {twoFAStatus && <div className="text-sm mt-1">{twoFAStatus}</div>}
          </div>
        )}
        <div className="flex gap-2 items-center mb-2">
          <span>Passkey: </span>
          <button className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded" onClick={handleRegisterPasskey}>Register</button>
          {passkeyStatus && <span className="text-sm ml-2">{passkeyStatus}</span>}
        </div>
        <div className="mb-2">
          <h3 className="font-semibold text-md">Active Sessions</h3>
          <ul className="text-sm">
            {sessionsList.map(sess => (
              <li key={sess.id} className="mb-1 flex justify-between">
                <span>{sess.device} ({sess.location})</span>
                <span className="text-gray-500">{sess.lastActive}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-md">Account Activity</h3>
          <ul className="text-sm">
            {activityList.map((a, i) => (
              <li key={i} className="mb-1 flex justify-between">
                <span>{a.event}</span>
                <span className="text-gray-500">{a.time} ({a.ip})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Notifications Preferences</h2>
        <label><input type="checkbox" /> Product updates</label>
        <label><input type="checkbox" /> Chat completion alerts</label>
        <label><input type="checkbox" checked disabled /> Security alerts</label>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Accessibility Options</h2>
        <label>Font Size <input type="range" min="14" max="24" className="ml-2" /></label>
        <label>Message Preview Length <input type="range" min="1" max="5" className="ml-2" /></label>
      </section>
      <section>
        <h2 className="font-semibold mb-2">Data and Privacy</h2>
        <button className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded mr-2">Download My Data</button>
        <button className="bg-red-500 text-white px-4 py-2 rounded">Delete Account</button>
      </section>
    </div>
  );
};

export default AccountPage;
