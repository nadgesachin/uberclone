import React from 'react';

export default function CommentList({ items = [] }) {
  if (!items.length) return <div className="text-sm text-gray-500">No comments yet.</div>;
  return (
    <ul className="space-y-3">
      {items.map(c => (
        <li key={c.id} className="p-3 bg-white rounded shadow-sm">
          <div className="text-sm text-gray-700">{c.text}</div>
          <div className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
}
