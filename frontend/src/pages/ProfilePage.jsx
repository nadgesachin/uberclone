import React from 'react';

const ProfilePage = () => {
  // Minimal profile page; integrate auth/profile APIs as needed
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Your profile</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-sm text-gray-600">Profile details and settings will appear here.</p>
      </div>
    </main>
  );
};

export default ProfilePage;
