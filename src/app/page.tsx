
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useDatabase } from "@/firebase";
import { useState, useEffect } from "react";
import { ref, onValue, query, limitToFirst } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Users, Video, Building, ArrowRight, PlayCircle, BookOpen, Star, Briefcase, Calendar, Leaf, Music, BookText, Laptop, Bus, User, Palette, Lightbulb, GraduationCap } from "lucide-react";
import Link from "next/link";
import { WebsiteFooter } from "@/components/website-footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import CountUp from 'react-countup';
import { cn } from "@/lib/utils";

type HomePageContent = {
  headerText?: string;
  headerDescription?: string;
};

type AboutUsContent = {
  heading?: string;
  description?: string;
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

type Course = {
  id: string;
  courseName: string;
  description: string;
  courseImage: string;
  sellingPrice: string;
}

const HeroSection = () => {
    const heroImage = PlaceHolderImages.find(p => p.id === 'hero-students-main');
    const heroShape1 = PlaceHolderImages.find(p => p.id === 'hero-shape-1');
    const heroShape2 = PlaceHolderImages.find(p => p.id === 'hero-shape-2');
    const heroBookIcon = PlaceHolderImages.find(p => p.id === 'hero-book-icon');
    const heroLightbulbIcon = PlaceHolderImages.find(p => p.id === 'hero-lightbulb-icon');
    const studentAvatar1 = PlaceHolderImages.find(p => p.id === 'student-avatar-1');
    const studentAvatar2 = PlaceHolderImages.find(p => p.id === 'student-avatar-2');

    return (
        <section className="bg-background py-16 md:py-20 relative overflow-hidden">
            {heroShape1 && <Image src={heroShape1.imageUrl} alt="shape" width={100} height={100} className="absolute top-20 left-10 animate-pulse hidden lg:block" />}
            {heroShape2 && <Image src={heroShape2.imageUrl} alt="shape" width={100} height={100} className="absolute bottom-20 right-20 animate-pulse hidden lg:block" />}
            
            <div className="container mx-auto px-4 z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Column */}
                    <div className="space-y-8 text-center md:text-left">
                        <div className="flex items-center gap-2 text-primary justify-center md:justify-start">
                            {heroLightbulbIcon && <Image src={heroLightbulbIcon.imageUrl} alt="icon" width={24} height={24} />}
                            <span className="font-semibold">Gateway to Lifelong Learning</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary tracking-tight">
                            Unlock Your Potential with Online <span className="relative inline-block">Learning<span className="absolute bottom-0 left-0 w-full h-1.5 bg-yellow-400 -z-10 -mb-2"></span></span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Discover a world of knowledge and opportunities with our online education platform. Pursue a new career.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                            <div className="flex items-center gap-4">
                                {heroBookIcon && <Image src={heroBookIcon.imageUrl} alt="icon" width={40} height={40} className="hidden sm:block" />}
                                <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                                    <Link href="/courses">View All Course <ArrowRight className="ml-2"/></Link>
                                </Button>
                            </div>
                             <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {studentAvatar1 && <Image src={studentAvatar1.imageUrl} alt="student" width={40} height={40} className="rounded-full border-2 border-white"/>}
                                    {studentAvatar2 && <Image src={studentAvatar2.imageUrl} alt="student" width={40} height={40} className="rounded-full border-2 border-white"/>}
                                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-white">+</div>
                                </div>
                                <div>
                                    <p className="font-bold text-secondary">2k students</p>
                                    <p className="text-sm text-muted-foreground">Join our online class</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="relative flex justify-center mt-12 md:mt-0">
                        {heroImage ? (
                            <Image
                                src={heroImage.imageUrl}
                                alt={heroImage.description}
                                width={600}
                                height={600}
                                className="w-full max-w-md lg:max-w-lg h-auto object-contain"
                                data-ai-hint={heroImage.imageHint}
                                priority
                            />
                        ) : <Skeleton className="w-full h-[500px]" />}
                        
                        <Card className="absolute -bottom-4 -left-4 sm:left-0 bg-white/80 backdrop-blur-sm w-48 shadow-lg border">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Star className="w-6 h-6 text-blue-500 fill-current" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-secondary">4.5</p>
                                    <p className="text-xs text-muted-foreground">(2.4k Review)</p>
                                </div>
                            </CardContent>
                        </Card>
                         <Card className="absolute -top-4 -right-4 sm:right-0 bg-white/80 backdrop-blur-sm w-48 shadow-lg border">
                            <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <GraduationCap className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-secondary">100+</p>
                                    <p className="text-xs text-muted-foreground">Online Course</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </section>
    );
};


const AboutUsSection = ({ content }: { content: AboutUsContent }) => {
    const aboutImage = PlaceHolderImages.find(p => p.id === 'about-us-campus');
    if (!content || !content.heading) return null;
    const points = [content.point1, content.point2, content.point3].filter(Boolean);

    return (
        <section className="bg-muted/30 py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight">{content.heading || "Learning with Love and Laughter"}</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">{content.description || "Fifth saying upon divide divide rule for deep their female all hath brined mid days and beast greater grass signs abundantly."}</p>
                        {points.length > 0 && (
                            <ul className="space-y-4 pt-2">
                                {points.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                        <span className="text-muted-foreground">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Button asChild className="text-base gradient-button rounded-full">
                          <Link href="/about">Read More</Link>
                        </Button>
                    </div>
                    <div>
                        {aboutImage ? (
                            <Image
                                src={aboutImage.imageUrl}
                                alt={aboutImage.description}
                                width={600}
                                height={450}
                                className="rounded-xl shadow-2xl w-full h-auto"
                                data-ai-hint={aboutImage.imageHint}
                            />
                        ) : <Skeleton className="w-full h-[450px] rounded-xl" /> }
                    </div>
                </div>
            </div>
        </section>
    );
};

const FeaturesSection = () => {
    const features = [
        { icon: <BookOpen className="w-12 h-12 text-primary"/>, title: "Better Future", description: "Set have find did not hath given lights dominion second you're fill." },
        { icon: <Users className="w-12 h-12 text-primary"/>, title: "Qualified Trainers", description: "Set have find did not hath given lights dominion second you're fill." },
        { icon: <Briefcase className="w-12 h-12 text-primary"/>, title: "Job Opportunities", description: "Set have find did not hath given lights dominion second you're fill." },
    ];

    return (
        <section className="py-20 md:py-28 bg-background">
             <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight">Awesome Features</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Discover the amazing features that make our platform unique.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map(feature => (
                        <Card key={feature.title} className="text-center p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 rounded-xl">
                            <CardContent className="space-y-4">
                                <div className="inline-block p-4 bg-primary/10 rounded-full">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-secondary">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
             </div>
        </section>
    );
};

const ComputerClassesSection = () => {
    const computerClassesImage = PlaceHolderImages.find(p => p.id === 'learning-circle-students');
    const features = [
        { icon: <Calendar size={32} />, color: 'bg-yellow-100 text-yellow-500', title: 'School Events', description: 'Alienm phaedrum torquatos nec eu, vis detraxit periculis ex, nihil expetendis in mei.' },
        { icon: <Leaf size={32} />, color: 'bg-green-100 text-green-500', title: 'Nature & Science', description: 'Discover the wonders of nature and science through hands-on activities.' },
        { icon: <Music size={32} />, color: 'bg-cyan-100 text-cyan-500', title: 'Music Lessons', description: 'Unleash your musical talents with our comprehensive music lessons.' },
        { icon: <BookText size={32} />, color: 'bg-red-100 text-red-500', title: 'Language Arts', description: 'Improve your reading, writing, and communication skills.' },
        { icon: <Laptop size={32} />, color: 'bg-pink-100 text-pink-500', title: 'Coding Club', description: 'Dive into the world of technology and learn to code with our fun coding club.' },
        { icon: <Bus size={32} />, color: 'bg-teal-100 text-teal-500', title: 'School Bus', description: 'Safe and reliable transportation for students to and from school.' },
        { icon: <User size={32} />, color: 'bg-purple-100 text-purple-500', title: 'Expert Teachers', description: 'Learn from experienced and dedicated teachers who are passionate about education.' },
        { icon: <Palette size={32} />, color: 'bg-blue-100 text-blue-500', title: 'Art Classes', description: 'Explore your creativity with our engaging art classes for all ages.' },
    ];
    
    const [activeFeature, setActiveFeature] = useState(features[0]);

    return (
        <section className="bg-background py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative h-96 w-96 mx-auto flex items-center justify-center">
                        {features.map((item, index) => (
                             <div 
                                key={index} 
                                onMouseOver={() => setActiveFeature(item)}
                                className={cn(
                                    `absolute w-20 h-20 rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-all duration-300`,
                                    item.color,
                                    activeFeature.title === item.title ? 'scale-110 shadow-xl' : 'hover:scale-110 hover:shadow-xl'
                                )} 
                                style={{
                                    transform: `rotate(${index * 45}deg) translate(150px) rotate(-${index * 45}deg)`
                                 }}
                             >
                                {item.icon}
                            </div>
                        ))}
                        <div className="text-center w-64 transition-all duration-300">
                             <h3 className={cn("text-2xl font-bold text-secondary transition-opacity duration-300", activeFeature.title ? 'opacity-100' : 'opacity-0')}>{activeFeature.title}</h3>
                            <p className={cn("text-muted-foreground mt-2 max-w-xs transition-opacity duration-300", activeFeature.description ? 'opacity-100' : 'opacity-0')}>{activeFeature.description}</p>
                        </div>
                    </div>
                    <div className="flex justify-center mt-16 lg:mt-0">
                        {computerClassesImage ? (
                            <Image
                                src={computerClassesImage.imageUrl}
                                alt={computerClassesImage.description}
                                width={600}
                                height={617}
                                className="w-full max-w-md h-auto"
                                data-ai-hint={computerClassesImage.imageHint}
                            />
                        ) : <Skeleton className="w-full h-[600px] rounded-xl" />}
                    </div>
                </div>
            </div>
        </section>
    )
}

const OurCoursesSection = ({ courses }: { courses: Course[] }) => {
  const coursePlaceholder = PlaceHolderImages.find(p => p.id === 'course-thumbnail');

  if (courses.length === 0) return null;

  return (
      <section className="py-20 md:py-28 bg-muted/30">
          <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight">Special Courses</h2>
                  <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Explore a variety of courses designed for your success.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map((course) => {
                      const imageUrl = course.courseImage && !course.courseImage.startsWith('C:') 
                          ? course.courseImage 
                          : coursePlaceholder?.imageUrl || '';
                      
                      return (
                          <Card key={course.id} className="group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300">
                              <Image
                                  src={imageUrl}
                                  alt={course.courseName}
                                  width={400}
                                  height={250}
                                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                                  data-ai-hint={coursePlaceholder?.imageHint}
                               />
                              <CardContent className="p-6 space-y-3">
                                  <CardTitle className="text-xl text-secondary group-hover:text-primary transition-colors">{course.courseName}</CardTitle>
                                  <CardDescription className="font-bold text-lg text-primary">${course.sellingPrice}</CardDescription>
                                  <Button variant="link" asChild className="p-0 font-semibold">
                                      <Link href="#">View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                  </Button>
                              </CardContent>
                          </Card>
                      );
                  })}
              </div>
              <div className="text-center mt-16">
                  <Button asChild size="lg" className="gradient-button rounded-full">
                      <Link href="/courses">View All Courses</Link>
                  </Button>
              </div>
          </div>
      </section>
  );
};

const DataCounterSection = ({ items }: { items: DataCounter[] }) => {
    if (items.length === 0) return null;

    return (
        <section className="text-white py-20 bg-gradient-to-r from-primary to-accent">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {items.map((item) => (
                        <div key={item.id} className="flex flex-col items-center">
                            <p className="text-4xl lg:text-5xl font-bold">
                                <CountUp end={parseInt(item.count) || 0} duration={3} enableScrollSpy />+
                            </p>
                            <p className="font-medium mt-1 text-white/90">{item.heading}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const TestimonialsSection = () => {
  const testimonials = [
    { name: "Michel Hashale", role: "Sr. Web Designer", text: "Upon divide rule goodie, rule, for deep their female all hath brined mid days and beast greater grass signs abundantly." , image: PlaceHolderImages.find(p=>p.id === 'user-avatar-1')?.imageUrl },
    { name: "Jane Smith", role: "UX/UI Designer", text: "The curriculum is top-notch. I felt well-prepared for the industry after graduating. Highly recommended for aspiring designers." , image: PlaceHolderImages.find(p=>p.id === 'educator-portrait')?.imageUrl },
  ];
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary tracking-tight">Happy Students</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Hear what our students have to say about their learning experience.</p>
        </div>
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index}>
                <Card className="p-8 text-center border-none shadow-none bg-transparent">
                  <CardContent className="space-y-6">
                    <Image src={testimonial.image || ''} alt={testimonial.name} width={100} height={100} className="rounded-full mx-auto" />
                    <p className="text-lg text-muted-foreground italic">"{testimonial.text}"</p>
                    <div>
                      <h4 className="font-bold text-secondary">{testimonial.name}</h4>
                      <p className="text-sm text-primary">{testimonial.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
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
  const [courses, setCourses] = useState<Course[]>([]);
  
  useEffect(() => {
    if (!database) return;
    setLoading(true);

    const dataPaths = {
        'websiteContent/content/homePage': setHomePageContent,
        'websiteContent/content/aboutUs': setAboutUsContent,
        'chooseUs': setChooseUsItems,
        'dataCounters': setDataCounters,
    };

    const coursesQuery = query(ref(database, 'courses'), limitToFirst(3));

    let loadedCount = 0;
    const totalToLoad = Object.keys(dataPaths).length + 1; // +1 for courses

    const checkAllDataLoaded = () => {
        loadedCount++;
        if (loadedCount >= totalToLoad) {
            setLoading(false);
        }
    };

    const unsubscribers = Object.entries(dataPaths).map(([path, setter]) => {
      onValue(ref(database, path), (snapshot) => {
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
        checkAllDataLoaded();
      }, { onlyOnce: true });
    });

    onValue(coursesQuery, (snapshot) => {
        const coursesData: Course[] = [];
        if(snapshot.exists()) {
            snapshot.forEach(child => {
                coursesData.push({ id: child.key!, ...child.val()});
            });
        }
        setCourses(coursesData);
        checkAllDataLoaded();
    }, { onlyOnce: true });

  }, [database]);


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <WebsiteHeader />
      <main className="flex-1">
        <HeroSection />
        <AboutUsSection content={aboutUsContent} />
        <FeaturesSection />
        <ComputerClassesSection />
        <DataCounterSection items={dataCounters} />
        <OurCoursesSection courses={courses} />
        <TestimonialsSection />
      </main>
      <WebsiteFooter />
    </div>
  );
}
