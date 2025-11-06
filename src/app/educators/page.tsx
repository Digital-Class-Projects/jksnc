
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabase } from "@/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WebsiteFooter } from "@/components/website-footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type Educator = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
};

export default function EducatorsPage() {
  const database = useDatabase();
  const [educators, setEducators] = useState<Educator[]>([]);
  const [loading, setLoading] = useState(true);
  const educatorImage = PlaceHolderImages.find(p => p.id === 'educator-portrait');

  useEffect(() => {
    if (!database) return;
    setLoading(true);
    const educatorsQuery = query(ref(database, 'educators'), orderByChild('name'));
    const unsubscribe = onValue(educatorsQuery, (snapshot) => {
      const educatorsData: Educator[] = [];
      snapshot.forEach(childSnapshot => {
        educatorsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setEducators(educatorsData);
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
            <h1 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">Our Educators</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Meet the dedicated professionals and experts guiding our students to success.</p>
          </div>
          
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="p-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Skeleton className="h-32 w-32 rounded-full" />
                            <div className="space-y-2 w-full">
                                <Skeleton className="h-6 w-3/4 mx-auto" />
                                <Skeleton className="h-4 w-1/2 mx-auto" />
                            </div>
                        </div>
                    </Card>
                ))}
             </div>
          ) : educators.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {educators.map((educator) => (
                <Card key={educator.id} className="text-center overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group border-border/50 rounded-xl">
                    <CardContent className="p-8">
                        <Avatar className="w-36 h-36 mx-auto mb-6 border-4 border-primary/10 group-hover:border-primary transition-colors duration-300">
                            <AvatarImage src={educator.imageUrl || educatorImage?.imageUrl || ''} alt={educator.name} className="object-cover" />
                            <AvatarFallback className="text-3xl">{educator.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-bold text-secondary">{educator.name}</h3>
                        <p className="text-primary font-medium">{educator.title}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-bold text-muted-foreground">No Educators Found</h2>
                <p className="mt-2 text-muted-foreground">Our team of educators will be revealed soon.</p>
            </div>
          )}
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
