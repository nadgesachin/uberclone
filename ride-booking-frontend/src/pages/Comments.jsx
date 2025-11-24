import React, { useState, useEffect } from 'react';
import CommentForm from '../components/Comment/CommentForm.jsx';
import CommentList from '../components/Comment/CommentList.jsx';

export default function CommentsPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('rb_comments');
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const add = (c) => {
    const next = [c, ...items];
    setItems(next);
    try { localStorage.setItem('rb_comments', JSON.stringify(next)); } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded shadow p-4 mb-4">
          <h2 className="font-semibold">Comments</h2>
          <p className="text-sm text-gray-500">Share feedback or report issues.</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <CommentForm onAdd={add} />
        </div>
        <div className="mt-4 bg-white rounded shadow p-4">
          <CommentList items={items} />
        </div>
      </div>
    </div>
  );
}
