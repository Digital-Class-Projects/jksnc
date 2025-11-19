
"use client";

import { useState, useEffect } from "react";
import { useDatabase } from "@/firebase";
import { ref, push, onValue, remove, set, serverTimestamp } from "firebase/database";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, PlusCircle, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Notice = {
  id: string;
  topic: string;
  expiryDate: string;
  notice: string;
  createdAt: number;
};

export default function NoticeBoardPage() {
  const { toast } = useToast();
  const database = useDatabase();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [currentNotice, setCurrentNotice] = useState<Partial<Notice>>({ topic: "", notice: "" });
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);
    const noticesRef = ref(database, "notices");
    const unsubscribe = onValue(noticesRef, (snapshot) => {
      const noticesData: Notice[] = [];
      snapshot.forEach((childSnapshot) => {
        noticesData.push({
          id: childSnapshot.key!,
          ...childSnapshot.val(),
        });
      });
      setNotices(noticesData.sort((a, b) => b.createdAt - a.createdAt));
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database]);

  const handleOpenDialog = (notice: Notice | null = null) => {
    if (notice) {
      setIsEditMode(true);
      setCurrentNotice(notice);
      setExpiryDate(new Date(notice.expiryDate));
    } else {
      setIsEditMode(false);
      setCurrentNotice({ topic: "", notice: "" });
      setExpiryDate(undefined);
    }
    setOpenDialog(true);
  };

  const handleSaveNotice = async () => {
    if (!database || !currentNotice.topic || !currentNotice.notice || !expiryDate) {
      toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required fields.",
      });
      return;
    }

    try {
      if (isEditMode && currentNotice.id) {
        const noticeRef = ref(database, `notices/${currentNotice.id}`);
        await set(noticeRef, {
            topic: currentNotice.topic,
            notice: currentNotice.notice,
            expiryDate: format(expiryDate, "yyyy-MM-dd"),
            createdAt: currentNotice.createdAt, // Keep original creation date
        });
        toast({ title: "Success", description: "Notice has been updated." });
      } else {
        const noticesRef = ref(database, "notices");
        const newNoticeRef = push(noticesRef);
        await set(newNoticeRef, {
            topic: currentNotice.topic,
            notice: currentNotice.notice,
            expiryDate: format(expiryDate, "yyyy-MM-dd"),
            createdAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "New notice has been added." });
      }

      setOpenDialog(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save notice.",
      });
    }
  };
  
  const handleDeleteNotice = async (noticeId: string) => {
    if (!database) return;
    if (confirm("Are you sure you want to delete this notice?")) {
        try {
            await remove(ref(database, `notices/${noticeId}`));
            toast({ title: "Success", description: "Notice deleted successfully." });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete notice.' });
        }
    }
  };
  
  const filteredNotices = notices.filter(notice => 
    notice.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notice.notice.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Notice List</CardTitle>
              <CardDescription>Manage notices and announcements.</CardDescription>
            </div>
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1" onClick={() => handleOpenDialog()}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add New
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Notice' : 'Add New Notice'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">TOPIC</Label>
                    <Input id="topic" value={currentNotice.topic} onChange={(e) => setCurrentNotice(p => ({...p, topic: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">EXPIRY DATE</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="expiryDate"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expiryDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expiryDate ? format(expiryDate, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expiryDate}
                          onSelect={setExpiryDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notice">NOTICE</Label>
                    <Textarea id="notice" value={currentNotice.notice} onChange={(e) => setCurrentNotice(p => ({...p, notice: e.target.value}))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleSaveNotice}>
                    {isEditMode ? 'Update' : 'Submit Now'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-4">
             <Label htmlFor="search">Search:</Label>
             <Input id="search" placeholder="Search notices..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SR NO.</TableHead>
                <TableHead>TOPIC</TableHead>
                <TableHead>NOTICE</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>EXPIRY DATE</TableHead>
                <TableHead className="text-right">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading notices...
                  </TableCell>
                </TableRow>
              ) : filteredNotices.length > 0 ? (
                filteredNotices.map((notice, index) => (
                  <TableRow key={notice.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell className="font-medium">{notice.topic}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{notice.notice}</TableCell>
                    <TableCell>{new Date(notice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(notice.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(notice)}>
                          <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="ghost" size="icon" onClick={() => handleDeleteNotice(notice.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No notices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
