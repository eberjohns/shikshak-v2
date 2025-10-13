import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../lib/apiClient';
import { useToast } from '../../components/ui/Toast';

export default function TakeExam() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const exam = location.state?.exam || null; // we expect the exam to be passed via state

  // If exam not present, we could fetch exam details by id (not implemented here)
  const questions = exam?.questions || [];
  const [answers, setAnswers] = useState(() => questions.map(() => ''));
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const autosaveTimer = useRef(null);

  const setAnswer = (idx, value) => {
    const copy = [...answers];
    copy[idx] = value;
    setAnswers(copy);
    // schedule autosave
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(`exam_${examId}_draft`, JSON.stringify(copy));
        setLastSavedAt(new Date().toISOString());
      } catch {
        // ignore
      }
    }, 1000);
  };

  const toast = useToast();

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { answers: answers.map((a, i) => ({ question_id: questions[i].id, answer: a })) };
      await apiClient.post(`/api/student/exams/${examId}/submit`, payload);
      try { localStorage.removeItem(`exam_${examId}_draft`); } catch {}
      navigate('/student/submissions');
    } catch (err) {
      console.error('Submit failed', err);
      toast.push('Submit failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // restore draft if any
    try {
      const d = localStorage.getItem(`exam_${examId}_draft`);
      if (d) {
        const parsed = JSON.parse(d);
        if (Array.isArray(parsed) && parsed.length === questions.length) setAnswers(parsed);
      }
    } catch {
      // ignore
    }
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [examId, questions.length]);

  if (!exam) return <div>No exam data. Navigate from course page to take an exam.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold">{exam.title}</h1>
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium mb-2">{q.prompt || q.question}</div>
            <textarea value={answers[idx]} onChange={(e) => setAnswer(idx, e.target.value)} rows={6} className="w-full rounded border p-2" />
          </div>
        ))}

        <div className="flex items-center gap-4">
          <div>
            <button disabled={submitting} className={`px-4 py-2 rounded ${submitting ? 'bg-slate-400 cursor-wait' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}>
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          </div>
          <div className="text-sm text-slate-600">{lastSavedAt ? `Saved ${new Date(lastSavedAt).toLocaleTimeString()}` : 'Not saved yet'}</div>
        </div>
      </form>
    </div>
  );
}
