// src/pages/student/TakeExamPage.jsx

import React, { useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function TakeExamPage() {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const exam = location.state?.exam; // Get exam data passed from the link state

  // Initialize answers state
  const [answers, setAnswers] = useState(() => {
    if (!exam) return {};
    return exam.questions.reduce((acc, q) => {
      acc[q.id] = '';
      return acc;
    }, {});
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const submissionData = {
      answers: Object.entries(answers).map(([question_id, answer_text]) => ({
        question_id,
        answer_text,
      })),
    };

    try {
      await apiClient.post(`/student/exams/${examId}/submit`, submissionData);
      alert('Your exam has been submitted successfully!');
      navigate('/student/my-submissions'); // Redirect to their submissions page
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit exam. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!exam) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Error</h1>
        <p>Exam details not found. Please navigate from the course page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">{exam.title}</h1>
      <p className="text-lg text-muted-foreground mb-6">Please answer each question to the best of your ability.</p>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Exam Questions</CardTitle>
            <CardDescription>{exam.questions.length} questions total.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {exam.questions.map((question, index) => (
              <div key={question.id} className="space-y-3">
                <Label htmlFor={`question-${question.id}`} className="text-base font-semibold">
                  Question {index + 1}: {question.question_text}
                </Label>
                <Textarea
                  id={`question-${question.id}`}
                  value={answers[question.id]}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="min-h-[150px]"
                  required
                />
              </div>
            ))}
             {error && <p className="text-red-500 text-sm pt-4">{error}</p>}
            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Exam'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
