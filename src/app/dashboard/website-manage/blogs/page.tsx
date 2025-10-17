
"use client";

import { useState, useEffect } from 'react';
import { useDatabase } from '@/firebase';
import { ref, push, onValue, remove, serverTimestamp, query, orderByChild, set } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { SuccessDialog } from '@/components/success-dialog';

type Blog = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  imageUrl: string;
  createdAt: any;
};

export default function BlogsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [newBlog, setNewBlog] = useState({ title: '', content: '', authorName: '', imageUrl: '' });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!database) return;
    const blogsQuery = query(ref(database, 'blogs'), orderByChild('createdAt'));
    const unsubscribe = onValue(blogsQuery, (snapshot) => {
      const blogsData: Blog[] = [];
      snapshot.forEach(childSnapshot => {
        blogsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setBlogs(blogsData.reverse()); // RTDB doesn't have descending order easily, so reverse client-side
    });
    return () => unsubscribe();
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewBlog(prev => ({ ...prev, [id]: value }));
  };

  const handleAddBlog = async () => {
    if (!database || !newBlog.title || !newBlog.content || !newBlog.authorName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
      return;
    }
    try {
      const blogsRef = ref(database, 'blogs');
      const newBlogRef = push(blogsRef);
      await set(newBlogRef, {
        ...newBlog,
        createdAt: serverTimestamp(),
      });
      setSuccessMessage('New blog post has been added.');
      setShowSuccessDialog(true);
      setNewBlog({ title: '', content: '', authorName: '', imageUrl: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!database) return;
    try {
      await remove(ref(database, `blogs/${id}`));
      setSuccessMessage('Blog post has been deleted.');
      setShowSuccessDialog(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Blog Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Blog Title</Label>
            <Input id="title" value={newBlog.title} onChange={handleInputChange} placeholder="Enter the blog title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input id="authorName" value={newBlog.authorName} onChange={handleInputChange} placeholder="Enter the author's name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Blog Content</Label>
            <Textarea id="content" value={newBlog.content} onChange={handleInputChange} placeholder="Write your blog post here..." rows={10}/>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Header Image URL</Label>
            <Input id="imageUrl" value={newBlog.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
          </div>
          <Button onClick={handleAddBlog}>Add Post</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Blog Posts</CardTitle>
          <CardDescription>Manage your existing blog posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogs.length > 0 ? blogs.map(blog => (
                <TableRow key={blog.id}>
                  <TableCell className="font-medium">{blog.title}</TableCell>
                  <TableCell>{blog.authorName}</TableCell>
                  <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteBlog(blog.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No blog posts yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
