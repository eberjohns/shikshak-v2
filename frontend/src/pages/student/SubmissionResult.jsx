import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import FeedbackCard from '../../components/FeedbackCard';

export default function SubmissionResult() {
  const { submissionId } = useParams();
  const [result, setResult] = useState(null);

  const fetchResult = React.useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/student/submissions/${submissionId}`);
      setResult(res.data || null);
    } catch (err) {
      console.error('Failed to fetch submission result', err);
    }
  }, [submissionId]);

  useEffect(() => { fetchResult(); }, [submissionId, fetchResult]);

  if (!result) return <div>Loading submission...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">Submission Result</h1>
      <div className="mt-4 bg-white p-4 rounded shadow">
        <div className="text-lg font-semibold">Score: {result.score ?? 'N/A'}</div>
        <div className="mt-2">AI Summary: {result.ai_summary || 'No summary available'}</div>
      </div>

      <div className="mt-6 space-y-4">
        {(result.feedback || []).map((f, idx) => (
          <FeedbackCard key={idx} item={f} />
        ))}
      </div>
    </div>
  );
}
