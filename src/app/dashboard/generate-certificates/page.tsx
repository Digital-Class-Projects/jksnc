
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDatabase } from "@/firebase";
import { ref, onValue, set, push, remove, get } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import { PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";
import { SuccessDialog } from "@/components/success-dialog";

type Student = {
  id: string;
  studentName: string;
  fatherName: string;
  course: string;
  photoUrl?: string;
  branchId?: string;
  session?: string;
  rollNo?: string;
  marksPercentage?: string;
  enrollmentNo?: string;
  [key: string]: any;
};

type Branch = {
    id: string;
    name: string;
};

export type ItemLayout = {
    id: string;
    label: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold';
    color: string;
    type: 'text' | 'image';
    width?: number;
    height?: number;
}

export type Template = {
  id: string;
  name: string;
  url: string;
  items: ItemLayout[];
};

const initialTemplates: { [key: string]: Omit<Template, 'id'> } = {
  diploma: {
    name: "Diploma Certificate",
    url: "https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990",
     items: [
      { id: 'enrollmentNo', label: 'Enrollment No', type: 'text', x: 880, y: 225, fontSize: 14, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'studentName', label: 'Student Name', type: 'text', x: 240, y: 290, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'bold' },
      { id: 'fatherName', label: 'Father Name', type: 'text', x: 240, y: 320, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'course', label: 'Course', type: 'text', x: 230, y: 385, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'branchName', label: 'Branch Name', type: 'text', x: 210, y: 415, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'session', label: 'Session', type: 'text', x: 270, y: 445, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'marksPercentage', label: 'Grade', type: 'text', x: 600, y: 475, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'bold' },
      { id: 'rollNo', label: 'Roll No', type: 'text', x: 130, y: 475, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'issueDate', label: 'Issue Date', type: 'text', x: 580, y: 530, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
      { id: 'photoUrl', label: 'Photo', type: 'image', x: 740, y: 150, width: 90, height: 90 }
    ]
  },
   migration: {
    name: "Migration Certificate",
    url: "https://ik.imagekit.io/rgazxzsxr/Migration%20Certifiate.png?updatedAt=1760612547767",
    items: [
        { id: 'studentName', label: 'Student Name', type: 'text', x: 350, y: 262, fontSize: 20, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'bold' },
        { id: 'fatherName', label: 'Father Name', type: 'text', x: 350, y: 298, fontSize: 20, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
        { id: 'course', label: 'Course Name', type: 'text', x: 320, y: 333, fontSize: 20, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
        { id: 'session', label: 'Session Year', type: 'text', x: 805, y: 333, fontSize: 20, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
        { id: 'rollNo', label: 'Roll No', type: 'text', x: 250, y: 370, fontSize: 20, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' },
        { id: 'issueDate', label: 'Issue Date', type: 'text', x: 790, y: 405, fontSize: 16, fontFamily: 'Times New Roman', color: '#000000', fontWeight: 'normal' }
    ],
  },
  registration: {
    name: "Registration Certificate",
    url: "https://ik.imagekit.io/rgazxzsxr/Registration%20Certificate.png?updatedAt=1761992685429",
    items: []
  },
  marks: {
    name: "Marks Certificate",
    url: "https://ik.imagekit.io/rgazxzsxr/marks%20cards%20and%20registration%20CURVE%20FILE.png?updatedAt=1761988197015",
    items: []
  }
};

const AnnotationPanel = dynamic(() => import('@/components/AnnotationPanel'), {
    ssr: false,
    loading: () => <Skeleton className="w-full h-full" />
});

function LayoutAdjustmentDialog({ open, onOpenChange, template, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, template: Template, onSave: (newLayout: Template) => void }) {
  const [layout, setLayout] = useState<Template>(template);
  const [newFieldName, setNewFieldName] = useState('');
  
  useEffect(() => {
    if (open) {
       const itemsArray = Array.isArray(template.items) ? template.items : Object.values(template.items || {});
       setLayout({ ...template, items: itemsArray });
    }
  }, [template, open]);

  const handleLayoutUpdate = (newItems: ItemLayout[]) => {
    setLayout(prev => ({ ...prev, items: newItems }));
  };
  
  const handleAddNewField = () => {
    if (!newFieldName.trim()) return;
    const newField: ItemLayout = {
      id: newFieldName.trim().toLowerCase().replace(/\s/g, '_') + `_${Date.now()}`,
      label: newFieldName.trim(),
      x: 50, y: 50,
      type: 'text',
      fontSize: 12, fontFamily: 'Arial', color: '#000000', fontWeight: 'normal'
    };
    const currentItems = Array.isArray(layout.items) ? layout.items : Object.values(layout.items || []);
    setLayout(prev => ({ ...prev, items: [...currentItems, newField] }));
    setNewFieldName('');
  };

  const handleRemoveField = (idToRemove: string) => {
    const currentItems = Array.isArray(layout.items) ? layout.items : Object.values(layout.items || []);
    setLayout(prev => ({ ...prev, items: currentItems.filter(item => item.id !== idToRemove) }));
  };
  
  const items = Array.isArray(layout?.items) ? layout.items : Object.values(layout?.items || []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Adjust Layout for {template.name}</DialogTitle>
          <DialogDescription>Drag and drop the fields to adjust their positions. Save when you're done.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-4 h-[calc(90vh-120px)] overflow-hidden">
          <div className="relative bg-muted rounded-md h-full overflow-hidden flex items-center justify-center">
            {layout && <AnnotationPanel template={layout} onLayoutUpdate={handleLayoutUpdate} />}
          </div>
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              <h4 className="font-semibold">Field Controls</h4>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <Card key={item.id || index} className="p-2">
                    <div className="flex justify-between items-center">
                      <Label className="font-bold text-xs">{item.label}</Label>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveField(item.id)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                    </div>
                  </Card>
                ))}
              </div>
              <div className="mt-auto border-t pt-4 space-y-2">
                <h4 className="font-semibold text-sm">Add New Field</h4>
                <Input placeholder="Field Name (e.g., 'Grade')" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} />
                <Button onClick={handleAddNewField} className="w-full" size="sm">Add Field</Button>
              </div>
            </div>
             <DialogFooter className="pt-4 mt-auto">
              <Button onClick={() => onSave(layout)} className="w-full">Save Layout</Button>
            </DialogFooter>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function GenerateCertificatesPage() {
  const database = useDatabase();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationQueue, setGenerationQueue] = useState<string[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);

    const onData = (path: string, setter: (data: any[]) => void, processFn: (snapshot: any) => any[]) => {
      const dataRef = ref(database, path);
      return onValue(dataRef, (snapshot) => {
        setter(processFn(snapshot));
      });
    };

    const unsubStudents = onData("students", (data) => { setStudents(data); setFilteredStudents(data); }, (snap) => snap.exists() ? Object.entries(snap.val()).map(([id, val]: [string, any]) => ({ id, ...val, photoUrl: val.photoUrl || "https://i.imgur.com/iB3gYg0.png" })) : []);
    const unsubBranches = onData("branches", setBranches, (snap) => snap.exists() ? Object.entries(snap.val()).map(([id, val]: [string, any]) => ({ id, name: val.name })) : []);
    
    const unsubLayouts = onValue(ref(database, "certificateLayouts"), async (snapshot) => {
        let loadedTemplates: Template[] = [];
        if (snapshot.exists()) {
            loadedTemplates = Object.entries(snapshot.val()).map(([id, val]: [string, any]) => ({ id, ...val, items: Array.isArray(val.items) ? val.items : Object.values(val.items || {}) }));
        } else {
            // If no layouts in DB, load initials and save them
            loadedTemplates = Object.entries(initialTemplates).map(([id, val]) => ({id, ...val}));
            const layoutsRef = ref(database, 'certificateLayouts');
            const initialSave = Object.fromEntries(loadedTemplates.map(t => [t.id, t]));
            await set(layoutsRef, initialSave);
        }
        setTemplates(loadedTemplates);
        if (loadedTemplates.length > 0) setSelectedTemplateId(loadedTemplates[0].id);
        setIsLoading(false);
    });

    return () => { unsubStudents(); unsubLayouts(); unsubBranches(); };
  }, [database]);

  useEffect(() => {
      setFilteredStudents(selectedBranch === 'all' ? students : students.filter(s => s.branchId === selectedBranch));
      setSelectedStudentIds([]);
  }, [selectedBranch, students]);

  const processSingleCertificate = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!student || !template) return;

    const certContainer = document.createElement('div');
    certContainer.id = `cert-container-${student.id}`;
    
    const certWidth = 1123; 
    const certHeight = 794; 

    Object.assign(certContainer.style, {
      width: `${certWidth}px`, height: `${certHeight}px`, position: 'absolute',
      left: '-9999px', backgroundImage: `url(${template.url})`,
      backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
      fontFamily: 'Times New Roman, serif',
    });
    document.body.appendChild(certContainer);

    const studentWithDate = { 
      ...student,
      course: student.course || 'N/A',
      session: student.session || '2023-24',
      issueDate: new Date().toLocaleDateString('en-GB') 
    };
    
    const items = Array.isArray(template.items) ? template.items : Object.values(template.items || {});

    items.forEach(item => {
        const el = document.createElement('div');
        Object.assign(el.style, {
          position: 'absolute', left: `${item.x}px`, top: `${item.y}px`,
          whiteSpace: 'nowrap', fontFamily: item.fontFamily, fontSize: `${item.fontSize}px`,
          color: item.color, fontWeight: item.fontWeight,
        });

        if (item.type === 'text') {
            const value = (studentWithDate as any)[item.id] || (studentWithDate as any)[item.label.toLowerCase().replace(/\s/g, '')] || `{${item.label}}`;
            el.innerText = String(value);
            certContainer.appendChild(el);
        } else if (item.type === 'image' && (studentWithDate as any)[item.id]) {
            const imgEl = document.createElement('div');
            Object.assign(imgEl.style, {
                position: 'absolute', left: `${item.x}px`, top: `${item.y}px`,
                width: `${item.width}px`, height: `${item.height}px`,
                backgroundImage: `url(${(studentWithDate as any)[item.id]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            });
            certContainer.appendChild(imgEl);
        }
    });

    await new Promise(resolve => setTimeout(resolve, 500)); 

    try {
        const canvas = await html2canvas(certContainer, { 
            useCORS: true, 
            scale: 2,
            backgroundColor: null
        });
        const link = document.createElement('a');
        link.download = `${student.studentName}_${template.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch(err) {
        toast({ variant: 'destructive', title: "Generation failed", description: `Could not generate certificate for ${student.studentName}.`});
    } finally {
        if(document.body.contains(certContainer)){
          document.body.removeChild(certContainer);
        }
    }
  };
  
  useEffect(() => {
    if (generationQueue.length > 0) {
      processSingleCertificate(generationQueue[0]).then(() => setGenerationQueue(q => q.slice(1)));
    } else if (isGenerating) {
      setIsGenerating(false);
      setShowSuccessDialog(true);
    }
  }, [generationQueue, isGenerating]);

  const handleGenerate = () => {
    if (selectedStudentIds.length === 0) {
      toast({ variant: 'destructive', title: 'No students selected' }); return;
    }
    toast({ title: 'Generation Started', description: `Generating ${selectedStudentIds.length} certificate(s)...`});
    setIsGenerating(true);
    setGenerationQueue([...selectedStudentIds]);
  };
  
  const handleLayoutSave = async (newLayout: Template) => {
    if(!database) return;
    const itemsArray = Array.isArray(newLayout.items) ? newLayout.items : Object.values(newLayout.items);
    const layoutToSave = { ...newLayout, items: itemsArray };
    const layoutRef = ref(database, `certificateLayouts/${newLayout.id}`);
    try {
      await set(layoutRef, layoutToSave);
      toast({ title: "Layout Saved", description: `${newLayout.name} layout has been updated.`});
      setIsLayoutDialogOpen(false);
    } catch (e: any) {
       toast({ variant: 'destructive', title: "Error", description: e.message });
    }
  };

  const handleSelectAll = (checked: boolean) => setSelectedStudentIds(checked ? filteredStudents.map(s => s.id) : []);
  const handleSelectStudent = (studentId: string, checked: boolean) => setSelectedStudentIds(prev => checked ? [...prev, studentId] : prev.filter(id => id !== studentId));
  
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Certificates</CardTitle>
          <CardDescription>Select a template, adjust the layout if needed, then select students to generate certificates.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger className="w-full sm:w-64"><SelectValue placeholder="Select a template" /></SelectTrigger>
            <SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="outline" onClick={() => setIsLayoutDialogOpen(true)} disabled={!selectedTemplate}>Adjust Layout</Button>
          <Button onClick={handleGenerate} disabled={selectedStudentIds.length === 0 || isGenerating}>{isGenerating ? `Generating ${generationQueue.length}...` : `Generate (${selectedStudentIds.length})`}</Button>
        </CardContent>
      </Card>
      
      {selectedTemplate && <LayoutAdjustmentDialog open={isLayoutDialogOpen} onOpenChange={setIsLayoutDialogOpen} template={selectedTemplate} onSave={handleLayoutSave} />}

      <Card>
        <CardHeader>
          <CardTitle>Select Students</CardTitle>
          <div className="mt-4"><Label htmlFor="branch-select">Filter by Branch</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger id="branch-select" className="w-full sm:w-64"><SelectValue placeholder="Select a branch" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Branches</SelectItem>{branches.map(branch => <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead className="w-12"><Checkbox onCheckedChange={handleSelectAll} checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length} /></TableHead><TableHead>Student Name</TableHead><TableHead>Course</TableHead><TableHead>Photo</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={4} className="text-center">Loading students...</TableCell></TableRow> :
                filteredStudents.map(student => (
                  <TableRow key={student.id}>
                    <TableCell><Checkbox checked={selectedStudentIds.includes(student.id)} onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}/></TableCell>
                    <TableCell>{student.studentName}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell><Image src={student.photoUrl!} alt={student.studentName} width={40} height={40} className="w-10 h-10 rounded-full object-cover" /></TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <SuccessDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog} title="Success" description="Certificate generation complete." />
    </div>
  );
}
