
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useDatabase } from "@/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle } from "lucide-react";
import { WebsiteFooter } from "@/components/website-footer";

type Faq = {
  id: string;
  question: string;
  answer: string;
};

export default function FaqPage() {
  const database = useDatabase();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    setLoading(true);
    const faqQuery = query(ref(database, 'faqs'), orderByChild('question'));
    const unsubscribe = onValue(faqQuery, (snapshot) => {
      const faqsData: Faq[] = [];
      snapshot.forEach(childSnapshot => {
        faqsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setFaqs(faqsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [database]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WebsiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">Frequently Asked Questions</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Find answers to common questions about our courses, admission, and more.</p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-card p-6 md:p-10 rounded-xl shadow-lg border-border/50">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : faqs.length > 0 ? (
                <Accordion type="single" collapsible className="w-full" defaultValue={faqs[0]?.id}>
                  {faqs.map((faq) => (
                    <AccordionItem value={faq.id} key={faq.id} className="border-b border-border/50">
                      <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline py-6 text-secondary hover:text-primary transition-colors">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-muted-foreground pt-2 pb-6 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="mt-4 text-2xl font-bold text-muted-foreground">No Questions Yet</h2>
                    <p className="mt-2 text-muted-foreground">The FAQ section is being updated. Please check back soon.</p>
                </div>
              )}
          </div>
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
