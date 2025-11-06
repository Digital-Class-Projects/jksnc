
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { useDatabase } from "@/firebase";
import { ref, onValue } from "firebase/database";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";
import { WebsiteFooter } from "@/components/website-footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type GalleryImage = {
  id: string;
  imageUrl: string;
  caption?: string;
};

export default function GalleryPage() {
  const database = useDatabase();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const galleryImage = PlaceHolderImages.find(p => p.id === 'gallery-event');

  useEffect(() => {
    if (!database) return;
    setLoading(true);
    const imagesRef = ref(database, 'gallery');
    const unsubscribe = onValue(imagesRef, (snapshot) => {
      const imagesData: GalleryImage[] = [];
      snapshot.forEach(childSnapshot => {
        imagesData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setImages(imagesData);
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
            <h1 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">Our Gallery</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">A visual journey through our campus, events, and student life.</p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="w-full h-72 rounded-xl" />
              ))}
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-xl shadow-lg border-border/50">
                  <Image
                    src={image.imageUrl || galleryImage?.imageUrl || ''}
                    alt={image.caption || 'Gallery image'}
                    width={400}
                    height={400}
                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                    data-ai-hint={galleryImage?.imageHint}
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <p className="text-sm font-semibold truncate">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold text-muted-foreground">Gallery is Empty</h2>
                <p className="mt-2 text-muted-foreground">Check back later to see photos from our campus and events.</p>
            </div>
          )}
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
