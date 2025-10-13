import React, { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';
import { Link } from 'react-router-dom';

export default function MySubmissions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubs = async () => {
    try {
      const res = await apiClient.get('/api/student/my-submissions');
      setSubs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Submissions</h1>
      <div className="mt-4 space-y-2">
        {loading ? (
          [1,2].map((i) => (
            <div key={i} className="bg-white p-3 rounded shadow">
              <div className="font-medium"><Skeleton width="50%" height={18} /></div>
              <div className="text-sm text-slate-600 mt-2"><Skeleton width="30%" height={12} /></div>
            </div>
          ))
        ) : (
          <>
            {subs.length === 0 && <div>No submissions found.</div>}
            {subs.map(s => (
              <div key={s.id} className="bg-white p-3 rounded shadow flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.exam_title || s.title}</div>
                  <div className="text-sm text-slate-600">Submitted: {new Date(s.submitted_at).toLocaleString()}</div>
                </div>
                <Link to={`/student/submissions/${s.id}`} className="text-sky-600">View</Link>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
