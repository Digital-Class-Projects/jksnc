
"use client";

import { useState, useEffect } from 'react';
import { useDatabase } from '@/firebase';
import { ref, push, onValue, remove, query, orderByChild, set } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { SuccessDialog } from '@/components/success-dialog';

type Faq = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    if (!database) return;
    const faqQuery = query(ref(database, 'faqs'), orderByChild('question'));
    const unsubscribe = onValue(faqQuery, (snapshot) => {
      const faqsData: Faq[] = [];
      snapshot.forEach(childSnapshot => {
        faqsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setFaqs(faqsData);
    });
    return () => unsubscribe();
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewFaq(prev => ({ ...prev, [id]: value }));
  };

  const handleAddFaq = async () => {
    if (!database || !newFaq.question || !newFaq.answer) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill out both question and answer.' });
      return;
    }
    try {
      const faqsRef = ref(database, 'faqs');
      const newFaqRef = push(faqsRef);
      await set(newFaqRef, newFaq);
      setSuccessMessage('New FAQ has been added.');
      setShowSuccessDialog(true);
      setNewFaq({ question: '', answer: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  const handleDeleteFaq = async (id: string) => {
    if (!database) return;
    try {
      await remove(ref(database, `faqs/${id}`));
      setSuccessMessage('FAQ has been deleted.');
      setShowSuccessDialog(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input id="question" value={newFaq.question} onChange={handleInputChange} placeholder="Enter the question" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea id="answer" value={newFaq.answer} onChange={handleInputChange} placeholder="Enter the answer" />
          </div>
          <Button onClick={handleAddFaq}>Add FAQ</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing FAQs</CardTitle>
          <CardDescription>Manage your existing frequently asked questions.</CardDescription>
        </CardHeader>
        <CardContent>
          {faqs.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {faqs.map(faq => (
                <AccordionItem value={faq.id} key={faq.id}>
                  <div className="flex items-center justify-between">
                    <AccordionTrigger className="flex-1 text-left">{faq.question}</AccordionTrigger>
                    <Button variant="ghost" size="icon" className="ml-4" onClick={() => handleDeleteFaq(faq.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <AccordionContent>
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-center text-muted-foreground">No FAQs yet.</p>
          )}
        </CardContent>
      </Card>
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description={successMessage}
      />
    </div>
  );
}
