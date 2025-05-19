// src/app/forgot/page.tsx
import React from "react";

const ForgotPage: React.FC = () => {
  // TODO: Integrate with backend password reset API
  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      <form className="flex flex-col gap-4">
        <label>Email <input type="email" className="input" required /></label>
        <button className="bg-psychy-green text-white px-4 py-2 rounded font-semibold">Send Reset Link</button>
      </form>
      <div className="mt-4 text-sm text-gray-500"><a href="/login" className="text-psychy-green underline">Back to Sign In</a></div>
    </div>
  );
};

export default ForgotPage;
