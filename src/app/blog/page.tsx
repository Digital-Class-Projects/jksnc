
"use client";

import { WebsiteHeader } from "@/components/website-header";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useDatabase } from "@/firebase";
import { ref, onValue, query, orderByChild } from "firebase/database";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WebsiteFooter } from "@/components/website-footer";
import { PlaceHolderImages } from "@/lib/placeholder-images";

type Blog = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  imageUrl: string;
  createdAt: any;
};


export default function BlogPage() {
  const database = useDatabase();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const blogPostImage = PlaceHolderImages.find(p => p.id === 'blog-post-header');

  useEffect(() => {
    if (!database) return;
    setLoading(true);
    const blogsQuery = query(ref(database, 'blogs'), orderByChild('createdAt'));
    const unsubscribe = onValue(blogsQuery, (snapshot) => {
      const blogsData: Blog[] = [];
      snapshot.forEach(childSnapshot => {
        blogsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setBlogs(blogsData.reverse());
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
                <h1 className="text-4xl md:text-5xl font-bold text-secondary tracking-tight">Our Blog</h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Stay updated with the latest news, articles, and insights from our team of experts.</p>
            </div>
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="overflow-hidden group">
                            <Skeleton className="h-60 w-full" />
                            <CardContent className="p-6 space-y-4">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-16 w-full" />
                                <Skeleton className="h-10 w-32" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : blogs.length > 0 ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map(blog => (
                        <Card key={blog.id} className="flex flex-col overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group border-border/50">
                            <div className="flex-shrink-0 overflow-hidden">
                                <Image
                                    src={blog.imageUrl || blogPostImage?.imageUrl || ''}
                                    alt={blog.title}
                                    width={600}
                                    height={400}
                                    className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    data-ai-hint={blogPostImage?.imageHint}
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-between bg-card p-6">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-primary">
                                        <time dateTime={new Date(blog.createdAt).toISOString()}>
                                            {new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </time>
                                    </p>
                                    <CardTitle className="mt-2 text-xl font-semibold text-secondary group-hover:text-primary transition-colors">
                                      <Link href="#">{blog.title}</Link>
                                    </CardTitle>
                                    <CardDescription className="mt-3 text-base text-muted-foreground line-clamp-3">{blog.content}</CardDescription>
                                </div>
                                <div className="mt-6 flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">By {blog.authorName}</p>
                                    <Link href="#" className="text-sm font-semibold text-primary hover:text-secondary transition-colors flex items-center gap-1">
                                        Read More <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))}
                 </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <h2 className="text-2xl font-bold text-muted-foreground">No Blog Posts Yet</h2>
                    <p className="mt-2 text-muted-foreground">Check back later for our latest articles.</p>
                </div>
            )}
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
