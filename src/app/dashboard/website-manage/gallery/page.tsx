
"use client";

import { useState, useEffect } from 'react';
import { useDatabase } from '@/firebase';
import { ref, push, onValue, remove, set } from 'firebase/database';
// In a real app, you would use Firebase Storage. For this example, we'll just handle image URLs.
// import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { SuccessDialog } from '@/components/success-dialog';

type GalleryImage = {
  id: string;
  imageUrl: string;
  caption?: string;
};

export default function GalleryPage() {
  const database = useDatabase();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [newImage, setNewImage] = useState({ imageUrl: '', caption: '' });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    if (!database) return;
    const imagesRef = ref(database, 'gallery');
    const unsubscribe = onValue(imagesRef, (snapshot) => {
      const imagesData: GalleryImage[] = [];
      snapshot.forEach(childSnapshot => {
        imagesData.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setImages(imagesData);
    });
    return () => unsubscribe();
  }, [database]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewImage(prev => ({ ...prev, [id]: value }));
  };

  const handleAddImage = async () => {
    if (!database || !newImage.imageUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide an image URL.' });
      return;
    }
    try {
      const galleryRef = ref(database, 'gallery');
      const newImageRef = push(galleryRef);
      await set(newImageRef, newImage);
      setSuccessMessage('New image has been added to the gallery.');
      setShowSuccessDialog(true);
      setNewImage({ imageUrl: '', caption: '' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!database) return;
    try {
      await remove(ref(database, `gallery/${id}`));
      setSuccessMessage('Image has been deleted from the gallery.');
      setShowSuccessDialog(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Gallery Image</CardTitle>
          <CardDescription>
            Add an image by providing its URL. In a real app, this would be a file upload.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" value={newImage.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.png" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Input id="caption" value={newImage.caption} onChange={handleInputChange} placeholder="A descriptive caption" />
          </div>
          <Button onClick={handleAddImage}>Add Image</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Image Gallery</CardTitle>
          <CardDescription>Manage your existing gallery images.</CardDescription>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(image => (
                <div key={image.id} className="relative group">
                  <Image
                    src={image.imageUrl}
                    alt={image.caption || "Gallery Image"}
                    width={300}
                    height={300}
                    className="w-full h-auto aspect-square object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="icon" onClick={() => handleDeleteImage(image.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                   {image.caption && <p className="text-xs text-center text-muted-foreground mt-1 truncate">{image.caption}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No images in the gallery yet.</p>
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
