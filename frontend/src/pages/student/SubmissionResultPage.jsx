// src/pages/student/SubmissionResultPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

const getBadgeVariant = (errorType) => {
  switch (errorType) {
    case 'correct': return 'success';
    case 'conceptual': return 'destructive';
    case 'procedural': return 'secondary';
    case 'interpretational': return 'outline';
    case 'incomplete': return 'outline';
    default: return 'default';
  }
};

export function SubmissionResultPage() {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/student/submissions/${submissionId}`);
        setSubmission(response.data);
      } catch (err) {
        setError('Failed to fetch submission details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmission();
  }, [submissionId]);

  if (loading) return <p>Loading feedback report...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!submission) return <p>Submission not found.</p>;
   if (submission.overall_score === null) {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-2">Feedback Report</h1>
            <p className="text-lg text-muted-foreground mb-6">For Exam: {submission.exam.title}</p>
            <Card>
                <CardHeader>
                    <CardTitle>Grading in Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This submission has not been graded yet. Please check back later.</p>
                </CardContent>
            </Card>
        </div>
    )
   }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Feedback Report</h1>
  <p className="text-lg text-muted-foreground mb-6">For Exam: {submission.exam.title}</p>

  <Card className="mb-8 bg-card border-green-200">
        <CardHeader>
          <CardTitle>Overall Performance</CardTitle>
          <CardDescription>
            Your final score is <span className="font-bold text-lg">
              {Array.isArray(submission.overall_score) && submission.overall_score.length === 2
                ? `${submission.overall_score[0]} / ${submission.overall_score[1]}`
                : submission.overall_score !== null
                  ? `${submission.overall_score} / ?`
                  : 'Not Graded'}
            </span>
          </CardDescription>
        </CardHeader>
          <CardContent>
          <p className="text-foreground">{submission.overall_feedback}</p>
        </CardContent>
      </Card>
      
      <h2 className="text-2xl font-semibold mb-4">Detailed Feedback</h2>
      <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
        {submission.answers.map((answer, index) => (
          <AccordionItem value={`item-${index}`} key={answer.id}>
            <AccordionTrigger>
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-left font-semibold">Question {index + 1}</span>
                <Badge variant={getBadgeVariant(answer.error_type)}>{answer.error_type || 'N/A'}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="p-4 bg-popover rounded">
                <p className="font-semibold text-foreground">Original Question:</p>
                <p>{answer.question.question_text}</p>
              </div>
               <div className="p-4 bg-card border border-blue-200 rounded">
                <p className="font-semibold text-foreground">Your Answer:</p>
                <p>{answer.answer_text}</p>
              </div>
              <div className="p-4 bg-card border border-yellow-200 rounded">
                <p className="font-semibold text-foreground">AI Feedback:</p>
                <p>{answer.feedback}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
