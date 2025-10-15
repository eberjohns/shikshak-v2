// src/pages/teacher/TeacherExamDetailPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bot, Edit, ListChecks } from 'lucide-react';

export function TeacherExamDetailPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingRules, setGradingRules] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [examRes, submissionsRes] = await Promise.all([
        apiClient.get(`/teacher/exams/${examId}`),
        apiClient.get(`/teacher/exams/${examId}/submissions`),
      ]);
      setExam(examRes.data);
      setSubmissions(submissionsRes.data);
      setGradingRules(examRes.data.grading_rules || '');
    } catch (err) {
      setError('Failed to fetch exam data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateExam = async ({ status, rules }) => {
    try {
      const payload = {};
      if (status) payload.status = status;
      if (rules !== undefined) payload.grading_rules = rules;

      const response = await apiClient.patch(`/teacher/exams/${examId}`, payload);
      setExam(response.data);
      setGradingRules(response.data.grading_rules || '');
      alert('Exam updated successfully!');
      return true;
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update exam.');
      return false;
    }
  };
  
  const handleGradeAll = async () => {
      if (!confirm('This will start the AI grading process for all ungraded submissions. This may take some time. Continue?')) return;
      setIsGrading(true);
      try {
          const response = await apiClient.post(`/teacher/exams/${examId}/grade-all`);
          alert(response.data.message);
          fetchData(); // Refresh data to show new scores
      } catch (err) {
          alert(err.response?.data?.detail || 'Grading failed.');
      } finally {
          setIsGrading(false);
      }
  };

  if (loading) return <p>Loading exam management page...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!exam) return <p>Exam not found.</p>;

  const ungradedCount = submissions.filter(s => s.overall_score === null).length;

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{exam.title}</h1>
          <Badge variant={exam.status === 'published' ? 'success' : 'secondary'}>{exam.status}</Badge>
        </div>
        <div className="flex gap-2">
           <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Rules & Publish</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Grading Rules & Status</DialogTitle>
                <DialogDescription>
                  Provide clear rules for the AI. You can also publish the exam here.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Label htmlFor="gradingRules">Grading Rules</Label>
                <Textarea id="gradingRules" value={gradingRules} onChange={(e) => setGradingRules(e.target.value)} className="min-h-[150px]" />
              </div>
              <DialogFooter>
                 {exam.status !== 'published' && 
                    <Button variant="secondary" onClick={() => handleUpdateExam({ status: 'published', rules: gradingRules })}>Save and Publish</Button>
                 }
                <Button onClick={() => handleUpdateExam({ rules: gradingRules })}>Save Rules</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button onClick={handleGradeAll} disabled={isGrading || ungradedCount === 0}>
            <Bot className="mr-2 h-4 w-4" /> {isGrading ? 'Grading...' : `Grade ${ungradedCount} Submissions`}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Student Submissions</CardTitle>
          <CardDescription>{submissions.length} student(s) have submitted this exam.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(sub => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.student.full_name}</TableCell>
                  <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    {sub.overall_score !== null ? `${sub.overall_score.toFixed(1)} / 10` : 'Not Graded'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
