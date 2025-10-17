
"use client";

import { useState, useEffect } from 'react';
import { useDatabase } from '@/firebase';
import { ref, push, onValue, remove, query, orderByChild, set } from 'firebase/database';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SuccessDialog } from '@/components/success-dialog';

type Educator = {
  id: string;
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
};

export default function EducatorsPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [educators, setEducators] = useState<Educator[]>([]);
  const [newEducator, setNewEducator] = useState({ name: '', title: '', bio: '', imageUrl: '' });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    if (!database) return;
    const educatorsQuery = query(ref(database, 'educators'), orderByChild('name'));
    const unsubscribe = onValue(educatorsQuery, (snapshot) => {
      const educatorsData: Educator[] = [];
      snapshot.forEach(childSnapshot => {
        educatorsData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setEducators(educatorsData);
    });
    return () => unsubscribe();
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewEducator(prev => ({ ...prev, [id]: value }));
  };

  const handleAddEducator = async () => {
    if (!database || !newEducator.name || !newEducator.title || !newEducator.bio) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill out name, title, and bio.' });
      return;
    }
    try {
      const educatorsRef = ref(database, 'educators');
      const newEducatorRef = push(educatorsRef);
      await set(newEducatorRef, newEducator);
      setSuccessMessage('New educator has been added.');
      setShowSuccessDialog(true);
      setNewEducator({ name: '', title: '', bio: '', imageUrl: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  const handleDeleteEducator = async (id: string) => {
    if (!database) return;
    try {
      await remove(ref(database, `educators/${id}`));
      setSuccessMessage('Educator has been deleted.');
      setShowSuccessDialog(true);
    } catch (error)      {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Educator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Educator's Name</Label>
            <Input id="name" value={newEducator.name} onChange={handleInputChange} placeholder="e.g., Jane Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title/Specialization</Label>
            <Input id="title" value={newEducator.title} onChange={handleInputChange} placeholder="e.g., Lead Instructor, Cyber Forensics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea id="bio" value={newEducator.bio} onChange={handleInputChange} placeholder="A short description of the educator." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Profile Picture URL</Label>
            <Input id="imageUrl" value={newEducator.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
          </div>
          <Button onClick={handleAddEducator}>Add Educator</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Existing Educators</CardTitle>
          <CardDescription>Manage your current educators.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Picture</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {educators.length > 0 ? educators.map(educator => (
                <TableRow key={educator.id}>
                  <TableCell>
                    <Avatar>
                        <AvatarImage src={educator.imageUrl} alt={educator.name} />
                        <AvatarFallback>{educator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{educator.name}</TableCell>
                  <TableCell>{educator.title}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEducator(educator.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">No educators yet.</TableCell>
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
