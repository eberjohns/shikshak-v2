import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Zap } from 'lucide-react';

export function TopicList({ schedule, role, onGenerateExam }) {
  if (!schedule || schedule.length === 0) {
    return <p>No schedule has been generated for this course yet.</p>;
  }

  // Helper to format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {schedule.map((topic, index) => (
        <AccordionItem value={`item-${index}`} key={topic.id}>
          <AccordionTrigger>
            <div className="flex justify-between items-center w-full pr-4">
              <span className="text-left font-semibold">{index + 1}. {topic.topic_name}</span>
              <span className="text-sm text-gray-500">Due: {formatDate(topic.end_date)}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4 py-2 bg-slate-50 rounded-md">
              <p className="mb-4">{topic.topic_description}</p>
              {role === 'teacher' && (
                <Button size="sm" onClick={() => onGenerateExam(topic.id)}>
                  <Zap className="mr-2 h-4 w-4" /> Generate Draft Exam
                </Button>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
