import React from 'react';

export default function FeedbackCard({ item }) {
  // item expected shape: { question, student_answer, ai_feedback, error_type }
  return (
    <div className="bg-white rounded shadow p-4">
      <h4 className="font-semibold">Question</h4>
      <p className="mb-2 text-slate-700">{item.question}</p>

      <h5 className="font-medium text-sm">Your answer</h5>
      <p className="mb-2 text-slate-600 whitespace-pre-wrap">{item.student_answer}</p>

      <h5 className="font-medium text-sm">AI Feedback</h5>
      <p className="mb-2 text-slate-600 whitespace-pre-wrap">{item.ai_feedback}</p>

      <div className="text-xs text-red-600">Error type: {item.error_type || 'N/A'}</div>
    </div>
  );
}
