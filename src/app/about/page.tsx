
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { useDatabase } from "@/firebase";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle } from "lucide-react";
import { WebsiteFooter } from "@/components/website-footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type AboutUsDetails = {
  heading: string;
  shortDescription: string;
};

type AboutUsContent = {
  heading?: string;
  description?: string;
  point1?: string;
  point2?: string;
  point3?: string;
}

export default function AboutPage() {
  const database = useDatabase();
  const [details, setDetails] = useState<AboutUsDetails | null>(null);
  const [content, setContent] = useState<AboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);

  const aboutBanner = PlaceHolderImages.find(p => p.id === 'about-banner');
  const aboutImage = PlaceHolderImages.find(p => p.id === 'about-image');

  useEffect(() => {
    if (!database) return;
    
    setLoading(true);
    
    const detailsRef = ref(database, 'websiteContent/aboutUsDetails');
    const contentRef = ref(database, 'websiteContent/content/aboutUs');
    
    let detailsLoaded = false;
    let contentLoaded = false;

    const checkLoading = () => {
        if (detailsLoaded && contentLoaded) {
            setLoading(false);
        }
    }

    const unsubDetails = onValue(detailsRef, (snapshot) => {
      setDetails(snapshot.val() ?? {});
      detailsLoaded = true;
      checkLoading();
    }, () => {
      detailsLoaded = true;
      checkLoading();
    });
    
    const unsubContent = onValue(contentRef, (snapshot) => {
        setContent(snapshot.val() ?? {});
        contentLoaded = true;
        checkLoading();
    }, () => {
        contentLoaded = true;
        checkLoading();
    });

    return () => {
        unsubDetails();
        unsubContent();
    };
  }, [database]);

  const points = [content?.point1, content?.point2, content?.point3].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WebsiteHeader />
      <main className="flex-1">
        <section
          className="relative bg-cover bg-center py-24 md:py-40 text-white"
          style={{ backgroundImage: aboutBanner ? `url(${aboutBanner.imageUrl})` : undefined }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{details?.heading || "About Us"}</h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-white/90">{details?.shortDescription || "Discover our mission, vision, and commitment to excellence."}</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
             <div className="space-y-6">
                {loading ? (
                    <>
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight">{content?.heading || 'Our Story'}</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">{content?.description || 'Learn more about our journey and commitment to excellence in education and professional development.'}</p>
                        {points.length > 0 && (
                            <ul className="space-y-4">
                                {points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                        <span className="text-muted-foreground">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
             </div>
             <div>
                {loading || !aboutImage ? (
                    <Skeleton className="w-full h-96 rounded-lg" />
                ): (
                    <Image
                        src={aboutImage.imageUrl}
                        alt={aboutImage.description}
                        width={600}
                        height={450}
                        className="rounded-lg shadow-2xl w-full h-auto object-cover"
                        data-ai-hint={aboutImage.imageHint}
                    />
                )}
             </div>
          </div>
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
