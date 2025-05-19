// src/app/settings/page.tsx
import React from "react";

const SettingsPage: React.FC = () => {
  // TODO: Integrate with backend for real settings data and actions
  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">General</h2>
        <label>Language
          <select className="input ml-2">
            <option>English</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
            <option>中文</option>
          </select>
        </label>
        <label className="block mt-2">Theme
          <select className="input ml-2">
            <option>Light</option>
            <option>Dark</option>
            <option>Psychy Green</option>
            <option>Solarized Light</option>
            <option>High Contrast</option>
            <option>Custom</option>
          </select>
        </label>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">AI Settings</h2>
        <label>Model
          <select className="input ml-2">
            <option>Ollama Default</option>
            <option>GPT-3.5</option>
            <option>GPT-4</option>
            <option>Custom Model</option>
          </select>
        </label>
        <label className="block mt-2">Streaming
          <input type="checkbox" className="ml-2" defaultChecked />
        </label>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Accessibility</h2>
        <label className="block mt-2" htmlFor="font-size">Font Size
          <select id="font-size" className="input ml-2" aria-label="Font Size">
            <option>Normal</option>
            <option>Large</option>
            <option>Extra Large</option>
          </select>
        </label>
        <label className="block mt-2" htmlFor="contrast">Contrast
          <select id="contrast" className="input ml-2" aria-label="Contrast">
            <option>Default</option>
            <option>High Contrast</option>
            <option>Low Contrast</option>
          </select>
        </label>
        <label className="block mt-2" htmlFor="reduced-motion">
          <input id="reduced-motion" type="checkbox" className="mr-2" aria-checked="false" />
          Reduce Motion
        </label>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Privacy</h2>
        <label className="block"><input type="checkbox" className="mr-2" />Allow data for improving AI</label>
        <label className="block mt-2"><input type="checkbox" className="mr-2" />Delete chat history on logout</label>
        <div className="mt-4 flex flex-col gap-2">
          <button className="btn btn-secondary w-full" aria-label="Export Data">Export My Data</button>
          <button className="btn btn-secondary w-full" aria-label="Manage Sessions">Manage Sessions & Devices</button>
          <button className="btn btn-danger w-full" aria-label="Delete Account">Delete My Account</button>
        </div>
        <p className="text-xs text-gray-500 mt-2">You can opt out of data collection or delete your account at any time. For more details, see our <a href="/privacy" className="underline">Privacy Policy</a>.</p>
      </section>
      <section className="mb-8">
        <h2 className="font-semibold mb-2">Advanced</h2>
        <label>Custom Theme Builder (JSON/CSS)</label>
        <textarea className="input w-full mt-2" rows={4} placeholder="Paste your custom theme JSON or CSS here..." aria-label="Custom Theme Builder" />
        <div className="mt-4">
          <label className="block mb-1">Language / Locale</label>
          <select className="input">
            <option>English (en)</option>
            <option>Español (es)</option>
            <option>Français (fr)</option>
            <option>Deutsch (de)</option>
            <option>中文 (zh)</option>
            <option>日本語 (ja)</option>
          </select>
        </div>
        <div className="mt-4 flex gap-4">
          <a href="/terms" className="underline text-sm">Terms of Service</a>
          <a href="/privacy" className="underline text-sm">Privacy Policy</a>
          <a href="/release-notes" className="underline text-sm">Release Notes</a>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
