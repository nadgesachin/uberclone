import React, { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    // In a real app we'd POST to contact endpoint. For demo, persist in local storage or just show success.
    setSent(true);
    setName(''); setEmail(''); setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Contact us</h2>
        {sent && <div className="text-sm text-green-600 mb-3">Thanks, we received your message.</div>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Your name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full p-2 border rounded" />
          </div>
          <div>
            <label className="text-sm text-gray-600">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1 w-full p-2 border rounded h-28" />
          </div>
          <div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Send message</button>
          </div>
        </form>
      </div>
    </div>
  );
}
