// src/app/release-notes/page.tsx
import React from "react";

const ReleaseNotesPage: React.FC = () => {
  // TODO: Dynamically load release notes/changelog
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Release Notes</h1>
      <ul className="list-disc pl-6">
        <li>v1.0.0 - Initial release: Full-stack chat, account, settings, theming, and local LLM support.</li>
        <li>v1.1.0 - Added 2FA, passkey, and advanced privacy controls.</li>
        <li>v1.2.0 - Improved accessibility and custom theme builder.</li>
        {/* Add more notes as needed */}
      </ul>
    </div>
  );
};

export default ReleaseNotesPage;
