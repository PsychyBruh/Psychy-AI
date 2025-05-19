// src/app/register/page.tsx
import React from "react";
import { register } from "../../lib/auth";

const RegisterPage: React.FC = () => {
  const [form, setForm] = React.useState({ email: '', username: '', password: '', confirm: '' });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (form.password !== form.confirm) return setError('Passwords do not match');
    try {
      await register({ email: form.email, username: form.username, password: form.password });
      setSuccess('Registration successful! Please check your email to verify your account.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label>Email <input type="email" className="input" name="email" value={form.email} onChange={handleChange} required /></label>
        <label>Username <input type="text" className="input" name="username" value={form.username} onChange={handleChange} required /></label>
        <label>Password <input type="password" className="input" name="password" value={form.password} onChange={handleChange} required minLength={8} /></label>
        <label>Confirm Password <input type="password" className="input" name="confirm" value={form.confirm} onChange={handleChange} required minLength={8} /></label>
        <label>Profile Picture <input type="file" className="input" /></label>
        <label>Bio <textarea className="input" /></label>
        <label>Social Links <input type="text" className="input" placeholder="@twitter, github, ..." /></label>
        <div className="flex items-center gap-2">
          <input type="checkbox" required />
          <span>I agree to the Terms of Service & Privacy Policy</span>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button className="bg-psychy-green text-white px-4 py-2 rounded font-semibold">Register</button>
      </form>
      <div className="mt-4 text-sm text-gray-500">Already have an account? <a href="/login" className="text-psychy-green underline">Sign in</a></div>
    </div>
  );
};

export default RegisterPage;
