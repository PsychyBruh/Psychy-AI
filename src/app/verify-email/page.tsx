// src/app/verify-email/page.tsx
import React, { useState } from "react";
import axios from "axios";

const VerifyEmailPage: React.FC = () => {
  const [status, setStatus] = useState<string | null>(null);

  const handleResend = async () => {
    setStatus(null);
    try {
      await axios.post("/api/account/resend-verification");
      setStatus("Verification email sent!");
    } catch {
      setStatus("Failed to resend verification email.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Verify Your Email</h1>
      <p className="mb-4">
        A verification link has been sent to your email. Please check your inbox
        and follow the instructions to verify your account.
      </p>
      <button
        className="bg-psychy-green text-white px-4 py-2 rounded font-semibold"
        onClick={handleResend}
      >
        Resend Verification Email
      </button>
      {status && (
        <div className="mt-2 text-sm text-gray-600">{status}</div>
      )}
    </div>
  );
};

export default VerifyEmailPage;
