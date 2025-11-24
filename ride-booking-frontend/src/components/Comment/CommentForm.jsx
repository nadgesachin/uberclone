import React, { useState } from 'react';

export default function CommentForm({ onAdd }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = { id: 'c_' + Date.now(), text: text.trim(), createdAt: Date.now() };
    onAdd(comment);
    setText('');
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full p-2 border rounded" placeholder="Write your comment" rows={3} />
      <div className="flex justify-end">
        <button type="submit" className="px-3 py-1 bg-indigo-600 text-white rounded">Comment</button>
      </div>
    </form>
  );
}
