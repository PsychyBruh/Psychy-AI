// src/app/login/page.tsx
import React from "react";
import { login } from "../../lib/auth";

const LoginPage: React.FC = () => {
  const [form, setForm] = React.useState({ emailOrUsername: '', password: '' });
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    try {
      await login(form);
      setSuccess('Login successful!');
      // TODO: Redirect to chat or account page
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Sign In</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label>Email or Username <input type="text" className="input" name="emailOrUsername" value={form.emailOrUsername} onChange={handleChange} required /></label>
        <label>Password <input type="password" className="input" name="password" value={form.password} onChange={handleChange} required /></label>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button className="bg-psychy-green text-white px-4 py-2 rounded font-semibold">Sign In</button>
      </form>
      <div className="mt-4 text-sm text-gray-500">Don't have an account? <a href="/register" className="text-psychy-green underline">Register</a></div>
      <div className="mt-2 text-sm text-gray-500"><a href="/forgot" className="underline">Forgot password?</a></div>
    </div>
  );
};

export default LoginPage;
