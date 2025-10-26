import { useState, useEffect } from 'react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { Input } from './input';
import { Textarea } from './textarea';
import apiClient from '../../api/apiClient';

export function QuestionManager({ examId, onUpdate, examStatus }) {
  const [questions, setQuestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    marks: 1
  });

  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen, examId]);

  const loadQuestions = async () => {
    try {
      const response = await apiClient.get(`/teacher/exams/${examId}/questions`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const handleUpdateQuestion = async (questionId, updatedData) => {
    if (!updatedData.question_text.trim() || !updatedData.marks) {
      setEditError('Question text and marks are required.');
      return;
    }
    setEditError('');
    try {
      await apiClient.put(`/teacher/questions/${questionId}`, updatedData);
      await loadQuestions();
      setEditingQuestion(null);
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question_text.trim() || !newQuestion.marks) {
      setAddError('Question text and marks are required.');
      return;
    }
    setAddError('');
    try {
      const payload = { question_text: newQuestion.question_text, marks: newQuestion.marks };
      await apiClient.post(`/teacher/exams/${examId}/questions`, payload);
      await loadQuestions();
      setNewQuestion({ question_text: '', marks: 1 });
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await apiClient.delete(`/teacher/questions/${questionId}`);
      await loadQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {examStatus === 'published' ? 'View Questions' : 'View/Edit Questions'}
        </Button>
      </DialogTrigger>
  <DialogContent className="max-w-3xl" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle>Manage Questions</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {questions.map((question, idx) => (
            <div key={question.id} className="border p-4 rounded-lg">
              <div className="mb-2">
                <span className="font-bold">Q{idx + 1}</span>
              </div>
              {editingQuestion === question.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={question.question_text}
                    onChange={(e) => setQuestions(questions.map(q => 
                      q.id === question.id ? { ...q, question_text: e.target.value } : q
                    ))}
                    placeholder="Enter question text"
                    disabled={examStatus === 'published'}
                  />
                  <Input
                    type="number"
                    value={question.marks}
                    onChange={(e) => setQuestions(questions.map(q => 
                      q.id === question.id ? { ...q, marks: parseInt(e.target.value) } : q
                    ))}
                    min="1"
                    disabled={examStatus === 'published'}
                  />
                  {editError && <p className="text-red-500 text-sm">{editError}</p>}
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateQuestion(question.id, { question_text: question.question_text, marks: question.marks })} disabled={examStatus === 'published'}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingQuestion(null); setEditError(''); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="font-medium">{question.question_text}</p>
                  <p className="text-sm text-muted-foreground">Marks: {question.marks}</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={() => setEditingQuestion(question.id)} disabled={examStatus === 'published'}>
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => handleDeleteQuestion(question.id)} disabled={examStatus === 'published'}>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Add New Question</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Question text"
                value={newQuestion.question_text}
                onChange={(e) => setNewQuestion({...newQuestion, question_text: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Marks"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({...newQuestion, marks: parseInt(e.target.value)})}
                min="1"
              />
              {addError && <p className="text-red-500 text-sm">{addError}</p>}
              <Button onClick={() => handleAddQuestion()} disabled={examStatus === 'published'}>Add Question</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}