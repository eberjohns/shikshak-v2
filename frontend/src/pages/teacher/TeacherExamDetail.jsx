import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';

export default function TeacherExamDetail() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [rules, setRules] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchExam = React.useCallback(async () => {
    try {
      const res = await apiClient.get(`/api/teacher/exams/${examId}`);
      setExam(res.data || null);
      setRules(res.data?.grading_rules || '');
    } catch (err) {
      console.error('Failed to fetch exam', err);
    }
  }, [examId]);

  useEffect(() => { fetchExam(); }, [examId, fetchExam]);

  const toast = useToast();

  const onSaveRules = async () => {
    try {
      setLoading(true);
      await apiClient.patch(`/api/teacher/exams/${examId}`, { grading_rules: rules });
      toast.push('Saved', 'success');
      fetchExam();
    } catch (err) {
      console.error('Save failed', err);
      toast.push('Save failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onPublish = async () => {
    try {
      setLoading(true);
      await apiClient.post(`/api/teacher/exams/${examId}/publish`);
      toast.push('Published', 'success');
      fetchExam();
    } catch (err) {
      console.error('Publish failed', err);
      toast.push('Publish failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onGradeAll = async () => {
    try {
      setLoading(true);
      await apiClient.post(`/api/teacher/exams/${examId}/grade-all`);
      toast.push('Grading started', 'info');
      fetchExam();
    } catch (err) {
      console.error('Grade all failed', err);
      toast.push('Grade all failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!exam) return <div>Loading exam...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{exam.title}</h1>
      <div className="mt-4 bg-white p-4 rounded shadow">
        <div className="mb-3">Status: {exam.status}</div>
        <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={6} className="w-full rounded border p-2" />
        <div className="mt-3 flex gap-3">
          <button onClick={onSaveRules} disabled={loading} className="bg-sky-600 text-white px-3 py-1 rounded">Save</button>
          <button onClick={onPublish} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">Publish</button>
          <button onClick={onGradeAll} disabled={loading} className="bg-orange-600 text-white px-3 py-1 rounded">Grade All</button>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="font-semibold">Submissions</h2>
        {exam.submissions?.length ? (
          <ul className="mt-2 space-y-2">
            {exam.submissions.map((s) => (
              <li key={s.id} className="bg-white p-3 rounded shadow">
                <div className="font-medium">{s.student_name || s.student?.name}</div>
                <div className="text-sm text-slate-600">Score: {s.score ?? 'N/A'}</div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2">No submissions yet.</div>
        )}
      </section>
    </div>
  );
}
