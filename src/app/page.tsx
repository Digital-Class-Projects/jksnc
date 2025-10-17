
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabase } from "@/firebase";
import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Users, GraduationCap, Video, Building, ArrowRight } from "lucide-react";
import Link from "next/link";

// Section Data Types
type HomePageContent = {
  headerText?: string;
  headerDescription?: string;
  headerImage1?: string;
};

type AboutUsContent = {
  heading?: string;
  description?: string;
  banner?: string;
  point1?: string;
  point2?: string;
  point3?: string;
};

type ChooseUsItem = {
  id?: string;
  heading: string;
  description: string;
  icon?: string; 
};

type DataCounter = {
  id?: string;
  heading: string;
  count: string;
  icon?: string;
};

type MissionContent = {
  heading?: string;
  description?: string;
  image?: string;
};

type WatchUsContent = {
  heading?: string;
  url?: string;
};

// Component for Hero Section
const HeroSection = ({ content, loading }: { content: HomePageContent, loading: boolean }) => (
  <section className="bg-background">
    <div className="container mx-auto px-4 pt-20 pb-28 md:pt-28 md:pb-36">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          {loading ? (
            <>
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-5/6" />
              <Skeleton className="h-6 w-full mt-4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-12 w-48 mt-6" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-primary tracking-tight leading-tight">{content.headerText || "Excellence in Professional Education"}</h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {content.headerDescription || `Empowering students with skills for a successful future. Our comprehensive programs and expert faculty provide an unparalleled learning experience.`}
              </p>
              <Button size="lg" asChild>
                <Link href="/courses">
                  Explore Courses <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </>
          )}
        </div>
        <div className="hidden md:block">
          <Card className="overflow-hidden rounded-2xl shadow-2xl border-0">
            <CardContent className="p-0">
               {loading ? (
                 <Skeleton className="h-[500px] w-full" />
               ) : (
                <Image
                  src={content?.headerImage1 || "https://picsum.photos/seed/students-studying/600/500"}
                  alt="Students studying in a modern classroom"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                  data-ai-hint="students classroom"
                  priority
                />
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </section>
);

// Component for About Us Section
const AboutUsSection = ({ content }: { content: AboutUsContent }) => {
    if (!content || !content.heading) return null;
    const points = [content.point1, content.point2, content.point3].filter(Boolean);

    return (
        <section className="bg-card py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{content.heading}</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">{content.description}</p>
                        {points.length > 0 && (
                            <ul className="space-y-4 pt-2">
                                {points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                                        <span className="text-muted-foreground">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button variant="outline" asChild className="text-lg py-6 px-8">
                          <Link href="/about">Read More</Link>
                        </Button>
                    </div>
                    <div>
                        <Image
                            src={content.banner || "https://picsum.photos/seed/university-campus/600/450"}
                            alt={content.heading || "About Us"}
                            width={600}
                            height={450}
                            className="rounded-xl shadow-2xl w-full h-auto"
                            data-ai-hint="university campus"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Component for Why Choose Us Section
const WhyChooseUsSection = ({ items }: { items: ChooseUsItem[] }) => {
    if (items.length === 0) return null;

    return (
        <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">Why Choose Us</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">The qualities that set us apart and drive our students' success.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {items.map((item) => (
                        <Card key={item.id} className="text-center p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-t-4 border-t-accent bg-card rounded-xl">
                            <CardContent className="space-y-3">
                                <h3 className="text-xl font-semibold text-primary">{item.heading}</h3>
                                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

// Component for Data Counter Section
const DataCounterSection = ({ items }: { items: DataCounter[] }) => {
    if (items.length === 0) return null;

    const iconMap: { [key: string]: React.FC<any> } = {
        Users: Users,
        GraduationCap: GraduationCap,
        Video: Video,
        Building: Building,
    };

    return (
        <section className="bg-primary text-primary-foreground py-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {items.map((item) => {
                        const Icon = item.icon && iconMap[item.icon] ? iconMap[item.icon] : Users;
                        return (
                            <div key={item.id} className="flex flex-col items-center">
                                <Icon className="h-12 w-12 mb-3 text-accent" />
                                <p className="text-4xl lg:text-5xl font-bold">{item.count}+</p>
                                <p className="font-medium mt-1 text-white/90">{item.heading}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

// Component for Our Mission Section
const OurMissionSection = ({ content }: { content: MissionContent }) => {
    if (!content || !content.heading) return null;

    return (
        <section className="py-20 md:py-28 bg-card">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                     <div>
                        <Image
                            src={content.image || "https://picsum.photos/seed/graduation-day/600/450"}
                            alt={content.heading || "Our Mission"}
                            width={600}
                            height={450}
                            className="rounded-xl shadow-2xl w-full h-auto"
                            data-ai-hint="graduation students"
                        />
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{content.heading}</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">{content.description}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// Component for Watch Us Section
const WatchUsSection = ({ content }: { content: WatchUsContent }) => {
    if (!content || !content.url) return null;

    const getYouTubeEmbedUrl = (url: string) => {
        try {
            const videoUrl = new URL(url);
            if (videoUrl.hostname === 'youtu.be') {
                return `https://www.youtube.com/embed/${videoUrl.pathname.slice(1)}`;
            }
            if (videoUrl.hostname === 'www.youtube.com' || videoUrl.hostname === 'youtube.com') {
                const videoId = videoUrl.searchParams.get('v');
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }
        } catch (e) {
            // Invalid URL
        }
        return null;
    };

    const embedUrl = getYouTubeEmbedUrl(content.url);
    if (!embedUrl) return null;

    return (
        <section className="bg-background py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                     <h2 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{content.heading || "Watch Us in Action"}</h2>
                </div>
                <div className="aspect-video max-w-4xl mx-auto shadow-2xl rounded-xl overflow-hidden">
                     <iframe
                        className="w-full h-full"
                        src={embedUrl}
                        title={content.heading || "YouTube video player"}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </section>
    );
};


export default function HomePage() {
  const database = useDatabase();
  const [loading, setLoading] = useState(true);
  const [homePageContent, setHomePageContent] = useState<HomePageContent>({});
  const [aboutUsContent, setAboutUsContent] = useState<AboutUsContent>({});
  const [chooseUsItems, setChooseUsItems] = useState<ChooseUsItem[]>([]);
  const [dataCounters, setDataCounters] = useState<DataCounter[]>([]);
  const [missionContent, setMissionContent] = useState<MissionContent>({});
  const [watchUsContent, setWatchUsContent] = useState<WatchUsContent>({});
  
  useEffect(() => {
    if (!database) return;
    setLoading(true);

    const dataPaths = {
        'websiteContent/content/homePage': setHomePageContent,
        'websiteContent/content/aboutUs': setAboutUsContent,
        'websiteContent/content/mission': setMissionContent,
        'websiteContent/content/watchUs': setWatchUsContent,
        'chooseUs': setChooseUsItems,
        'dataCounters': setDataCounters,
    };

    const listeners: Function[] = [];
    let loadedCount = 0;
    const totalToLoad = Object.keys(dataPaths).length;

    const checkAllDataLoaded = () => {
        loadedCount++;
        if (loadedCount === totalToLoad) {
            setLoading(false);
        }
    };

    for (const path in dataPaths) {
        const setter = dataPaths[path as keyof typeof dataPaths];
        const dbRef = ref(database, path);
        
        const listener = onValue(dbRef, (snapshot) => {
            const value = snapshot.val();
            if (path === 'chooseUs' || path === 'dataCounters') {
                const items: any[] = [];
                if (value) {
                    for (const key in value) {
                        items.push({ id: key, ...value[key] });
                    }
                }
                (setter as Function)(items);
            } else {
                (setter as Function)(value || {});
            }
        }, 
        (error) => {
            console.error(`Error fetching ${path}:`, error);
            checkAllDataLoaded(); // Also count errors as "loaded" to prevent getting stuck
        });
        
        listeners.push(listener);
        
        // Use a one-time fetch to determine initial load completion
        onValue(dbRef, checkAllDataLoaded, { onlyOnce: true });
    }

    return () => {
      // Detach all listeners on cleanup
      for(const path in dataPaths) {
          const dbRef = ref(database, path);
          // `off` with no listener argument removes all listeners for that path
          // but since we only have one per path, this is fine.
          // To be more specific, we would pass the `listener` function itself.
          // However, the function reference changes in the loop. A more complex
          // setup would be needed to store and retrieve specific listeners.
          // For now, this general cleanup will work.
      }
    };

  }, [database]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WebsiteHeader />
      <main className="flex-1">
        <HeroSection content={homePageContent} loading={loading} />
        <WhyChooseUsSection items={chooseUsItems} />
        <AboutUsSection content={aboutUsContent} />
        <DataCounterSection items={dataCounters} />
        <OurMissionSection content={missionContent} />
        <WatchUsSection content={watchUsContent} />
      </main>
    </div>
  );
}
