

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useDatabase } from "@/firebase";
import { ref, set, onValue, push, remove } from "firebase/database";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { SuccessDialog } from "@/components/success-dialog";
import Image from "next/image";

type HomePageContent = {
  headerText: string;
  headerDescription: string;
  headerImage1: string;
  headerImage2: string;
  headerImage3: string;
};

type AboutUsContent = {
  banner: string;
  heading: string;
  description: string;
  point1: string;
  point2: string;
  point3: string;
};

type ChooseUsItem = {
  id?: string;
  heading: string;
  description: string;
  icon: string;
};

type DataCounter = {
  id?: string;
  heading: string;
  count: string;
  icon: string;
};

type MissionContent = {
  heading: string;
  description: string;
  image: string;
};

type WatchUsContent = {
  heading: string;
  url: string;
};

type CertificateDesign = {
    name: string;
    imageUrl: string;
}

type ContentState = {
  homePage: Partial<HomePageContent>;
  aboutUs: Partial<AboutUsContent>;
  mission: Partial<MissionContent>;
  watchUs: Partial<WatchUsContent>;
  certificateDesigns: Partial<Record<string, CertificateDesign>>;
};

export default function HomePage() {
  const { toast } = useToast();
  const database = useDatabase();
  const [content, setContent] = useState<Partial<ContentState>>({
      homePage: {},
      aboutUs: {},
      mission: {},
      watchUs: {},
      certificateDesigns: {
        migration: {
            name: "Migration Certificate",
            imageUrl: "https://i.imgur.com/8QpYR8u.png"
        },
        diploma: {
            name: "Diploma Certificate",
            imageUrl: "https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990"
        }
      },
  });
  const [chooseUsList, setChooseUsList] = useState<ChooseUsItem[]>([]);
  const [dataCounterList, setDataCounterList] = useState<DataCounter[]>([]);

  const [newChooseUs, setNewChooseUs] = useState<Omit<ChooseUsItem, 'id'>>({ heading: "", description: "", icon: "" });
  const [newCounter, setNewCounter] = useState<Omit<DataCounter, 'id'>>({ heading: "", count: "", icon: "" });

  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [migrationCertPreview, setMigrationCertPreview] = useState<string | null>("https://i.imgur.com/8QpYR8u.png");
  const [diplomaCertPreview, setDiplomaCertPreview] = useState<string | null>("https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990");


  useEffect(() => {
    if (!database) return;
    const contentRef = ref(database, "websiteContent/content");
    const unsubscribe = onValue(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        setContent(prev => ({...prev, ...val}));
        if(val.certificateDesigns?.migration?.imageUrl) {
            setMigrationCertPreview(val.certificateDesigns.migration.imageUrl);
        }
        if(val.certificateDesigns?.diploma?.imageUrl) {
            setDiplomaCertPreview(val.certificateDesigns.diploma.imageUrl);
        }
      }
    });

    const chooseUsRef = ref(database, "chooseUs");
    const unsubChooseUs = onValue(chooseUsRef, (snapshot) => {
      const list: ChooseUsItem[] = [];
      snapshot.forEach(childSnapshot => {
        list.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setChooseUsList(list);
    });
    
    const dataCounterRef = ref(database, "dataCounters");
    const unsubDataCounter = onValue(dataCounterRef, (snapshot) => {
      const list: DataCounter[] = [];
       snapshot.forEach(childSnapshot => {
        list.push({ id: childSnapshot.key!, ...childSnapshot.val() });
      });
      setDataCounterList(list);
    });

    return () => {
        unsubscribe();
        unsubChooseUs();
        unsubDataCounter();
    };
  }, [database]);

  const handleInputChange = <T extends keyof Omit<ContentState, 'chooseUs' | 'dataCounter' | 'certificateDesigns'>>(section: T, field: keyof ContentState[T]) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setContent(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [field]: value
        }
    } as Partial<ContentState>));
  }
  
  const handleCertDesignChange = (certId: string, field: keyof CertificateDesign) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setContent(prev => ({
          ...prev,
          certificateDesigns: {
              ...prev.certificateDesigns,
              [certId]: {
                  ...(prev.certificateDesigns?.[certId] || { name: 'New Certificate', imageUrl: '' }),
                  [field]: value,
              }
          }
      }));
  }
  
  const handleCertImageURLChange = (certId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if(certId === 'migration') setMigrationCertPreview(value);
    if(certId === 'diploma') setDiplomaCertPreview(value);
    
    setContent(prev => ({
        ...prev,
        certificateDesigns: {
            ...prev.certificateDesigns,
            [certId]: {
                ...(prev.certificateDesigns?.[certId] || { name: 'New Certificate', imageUrl: '' }),
                imageUrl: value,
            }
        }
    }));
  }

  const handlePublish = async (section: keyof Omit<ContentState, 'chooseUs' | 'dataCounter'>) => {
    if (!database || !content[section]) return;

    let dataToSave = content[section];
    
    const contentRef = ref(database, `websiteContent/content/${section}`);
    try {
        await set(contentRef, dataToSave);
        setSuccessMessage("Content added successfully");
        setShowSuccessDialog(true);
    } catch(error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: (error as Error).message,
        });
    }
  };

  const handleAddChooseUs = async () => {
    if (!database || !newChooseUs.heading || !newChooseUs.description) return;
    try {
        const chooseUsRef = ref(database, "chooseUs");
        const newChooseUsRef = push(chooseUsRef);
        await set(newChooseUsRef, newChooseUs);
        setSuccessMessage("Data Updated Successfully");
        setShowSuccessDialog(true);
        setNewChooseUs({ heading: "", description: "", icon: "" });
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: (e as Error).message });
    }
  };

  const handleDeleteChooseUs = async (id: string) => {
    if(!database || !id) return;
    try {
        await remove(ref(database, `chooseUs/${id}`));
        setSuccessMessage("Data Updated Successfully");
        setShowSuccessDialog(true);
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: (e as Error).message });
    }
  };

  const handleAddDataCounter = async () => {
    if (!database || !newCounter.heading || !newCounter.count) return;
    try {
        const dataCountersRef = ref(database, "dataCounters");
        const newCounterRef = push(dataCountersRef);
        await set(newCounterRef, newCounter);
        setSuccessMessage("Data Updated Successfully");
        setShowSuccessDialog(true);
        setNewCounter({ heading: "", count: "", icon: "" });
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: (e as Error).message });
    }
  };

  const handleDeleteDataCounter = async (id: string) => {
    if(!database || !id) return;
    try {
        await remove(ref(database, `dataCounters/${id}`));
        setSuccessMessage("Data Updated Successfully");
        setShowSuccessDialog(true);
    } catch(e) {
        toast({ variant: "destructive", title: "Error", description: (e as Error).message });
    }
  }


  return (
    <div className="p-4 md:p-8">
      <Tabs defaultValue="home-page" className="w-full">
        <TabsList>
          <TabsTrigger value="home-page">Home Page</TabsTrigger>
          <TabsTrigger value="about-us">About Us</TabsTrigger>
          <TabsTrigger value="choose-us">Choose Us</TabsTrigger>
          <TabsTrigger value="data-counter">Data Counter</TabsTrigger>
          <TabsTrigger value="mission">Mission</TabsTrigger>
          <TabsTrigger value="watch-us">Watch Us</TabsTrigger>
          <TabsTrigger value="certificate-design">Certificate Design</TabsTrigger>
        </TabsList>
        <TabsContent value="home-page">
          <Card>
            <CardHeader>
              <CardTitle>Modify Home Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="headerText">HEADER TEXT</Label>
                <Input id="headerText" value={content.homePage?.headerText || ''} onChange={handleInputChange('homePage', 'headerText')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headerDescription">HEADER DESCRIPTION</Label>
                <Textarea
                  id="headerDescription"
                  placeholder="Text..."
                  value={content.homePage?.headerDescription || ''} 
                  onChange={handleInputChange('homePage', 'headerDescription')}
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="headerImage1">HEADER IMAGE 1</Label>
                  <Input id="headerImage1" type="file" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headerImage2">HEADER IMAGE 2</Label>
                  <Input id="headerImage2" type="file" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headerImage3">HEADER IMAGE 3</Label>
                  <Input id="headerImage3" type="file" />
                </div>
              </div>
              <div>
                <Button onClick={() => handlePublish('homePage')}>Publish</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="about-us">
          <Card>
            <CardHeader>
              <CardTitle>About Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="banner">BANNER</Label>
                <Input id="banner" type="file" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="about-us-heading">ABOUT US HEADING</Label>
                  <Input id="about-us-heading" placeholder="text..." value={content.aboutUs?.heading || ''} onChange={handleInputChange('aboutUs', 'heading')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-us-description">
                    ABOUT US DESCRIPTION
                  </Label>
                  <Textarea id="about-us-description" placeholder="text..." value={content.aboutUs?.description || ''} onChange={handleInputChange('aboutUs', 'description')}/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="about-us-point-1">ABOUT US POINT 1</Label>
                  <Input id="about-us-point-1" placeholder="1 2 3..." value={content.aboutUs?.point1 || ''} onChange={handleInputChange('aboutUs', 'point1')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-us-point-2">ABOUT US POINT 2</Label>
                  <Input id="about-us-point-2" placeholder="1 2 3..." value={content.aboutUs?.point2 || ''} onChange={handleInputChange('aboutUs', 'point2')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-us-point-3">ABOUT US POINT 3</Label>
                  <Input id="about-us-point-3" placeholder="1 2 3..." value={content.aboutUs?.point3 || ''} onChange={handleInputChange('aboutUs', 'point3')} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handlePublish('aboutUs')}>Publish</Button>
                <Button variant="outline">Preview</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="choose-us">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New "Why Choose Us" Reason</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="choose-us-heading">HEADING</Label>
                  <Input id="choose-us-heading" placeholder="e.g., Industrial Experts" value={newChooseUs.heading} onChange={(e) => setNewChooseUs(p => ({...p, heading: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="choose-us-description">DESCRIPTION</Label>
                  <Textarea id="choose-us-description" placeholder="text..." value={newChooseUs.description} onChange={(e) => setNewChooseUs(p => ({...p, description: e.target.value}))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="choose-us-icon">ICON</Label>
                  <Input id="choose-us-icon" type="file" />
                </div>
                <Button onClick={handleAddChooseUs}>Publish</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Current Entries</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>HEADING</TableHead>
                      <TableHead>DESCRIPTION</TableHead>
                      <TableHead className="text-right">ACTION</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chooseUsList.length > 0 ? chooseUsList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.heading}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteChooseUs(item.id!)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">No entries yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="data-counter">
           <div className="space-y-6">
                <Card>
                <CardHeader>
                    <CardTitle>Add New Counter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="data-counter-heading">HEADING</Label>
                        <Input id="data-counter-heading" placeholder="text..." value={newCounter.heading} onChange={(e) => setNewCounter(p => ({...p, heading: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="data-counter-count">COUNT</Label>
                        <Input id="data-counter-count" type="number" placeholder="0" value={newCounter.count} onChange={(e) => setNewCounter(p => ({...p, count: e.target.value}))}/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="data-counter-icon">ICON</Label>
                        <Input id="data-counter-icon" type="file" />
                    </div>
                    <Button onClick={handleAddDataCounter}>Add Counter</Button>
                </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Current Counters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead>HEADING</TableHead>
                                <TableHead>COUNT</TableHead>
                                <TableHead className="text-right">ACTION</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dataCounterList.length > 0 ? dataCounterList.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.heading}</TableCell>
                                    <TableCell>{item.count}</TableCell>
                                    <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteDataCounter(item.id!)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </TableCell>
                                </TableRow>
                                )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">No entries yet.</TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="mission">
          <Card>
            <CardHeader>
              <CardTitle>Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mission-heading">HEADING</Label>
                <Input id="mission-heading" placeholder="text..." value={content.mission?.heading || ''} onChange={handleInputChange('mission', 'heading')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mission-description">DESCRIPTION</Label>
                <Textarea id="mission-description" placeholder="text..." value={content.mission?.description || ''} onChange={handleInputChange('mission', 'description')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mission-image">IMAGE</Label>
                <Input id="mission-image" type="file" />
              </div>
              <Button onClick={() => handlePublish('mission')}>Publish</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="watch-us">
          <Card>
            <CardHeader>
              <CardTitle>Watch Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="watch-us-heading">HEADING</Label>
                <Input id="watch-us-heading" placeholder="text..." value={content.watchUs?.heading || ''} onChange={handleInputChange('watchUs', 'heading')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="watch-us-url">VIDEO URL</Label>
                <Input id="watch-us-url" placeholder="https://youtube.com/..." value={content.watchUs?.url || ''} onChange={handleInputChange('watchUs', 'url')} />
              </div>
              <Button onClick={() => handlePublish('watchUs')}>Publish</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="certificate-design">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Design</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Migration Certificate</h3>
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="migration-cert-name">Certificate Name</Label>
                                <Input 
                                    id="migration-cert-name" 
                                    value={content.certificateDesigns?.migration?.name || ''} 
                                    onChange={handleCertDesignChange('migration', 'name')} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="migration-cert-image-url">Background Image URL</Label>
                                <Input 
                                    id="migration-cert-image-url" 
                                    placeholder="https://example.com/image.png"
                                    value={content.certificateDesigns?.migration?.imageUrl || ''}
                                    onChange={handleCertImageURLChange('migration')}
                                />
                            </div>
                            {migrationCertPreview && (
                                <div className="p-2 border rounded-md">
                                    <p className="text-sm font-medium mb-2">Preview:</p>
                                    <Image src={migrationCertPreview} alt="Certificate Preview" width={200} height={280} className="rounded-md" unoptimized/>
                                </div>
                            )}
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-medium mb-2">Diploma Certificate</h3>
                        <div className="space-y-4 p-4 border rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="diploma-cert-name">Certificate Name</Label>
                                <Input 
                                    id="diploma-cert-name" 
                                    value={content.certificateDesigns?.diploma?.name || ''} 
                                    onChange={handleCertDesignChange('diploma', 'name')} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="diploma-cert-image-url">Background Image URL</Label>
                                <Input 
                                    id="diploma-cert-image-url" 
                                    placeholder="https://example.com/image.png"
                                    value={content.certificateDesigns?.diploma?.imageUrl || ''}
                                    onChange={handleCertImageURLChange('diploma')}
                                />
                            </div>
                            {diplomaCertPreview && (
                                <div className="p-2 border rounded-md">
                                    <p className="text-sm font-medium mb-2">Preview:</p>
                                    <Image src={diplomaCertPreview} alt="Certificate Preview" width={200} height={280} className="rounded-md" unoptimized/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              <Button onClick={() => handlePublish('certificateDesigns')}>Publish Certificate Designs</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        description={successMessage}
      />
    </div>
  );
}
