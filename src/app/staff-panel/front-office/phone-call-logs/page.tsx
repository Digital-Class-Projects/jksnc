
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, Edit, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type PhoneCallLog = {
  id: string;
  name: string;
  phone: string;
  date: string;
  nextFollowupDate: string;
  callType: "Outgoing" | "Incoming";
  duration: string;
  description: string;
  notes: string;
};

const initialLogs: PhoneCallLog[] = [
  {
    id: "1",
    name: "UDI",
    phone: "9434141813",
    date: "2025-10-17",
    nextFollowupDate: "2025-10-15",
    callType: "Outgoing",
    duration: "2",
    description: "DJ",
    notes: "SU",
  },
];

function AddNewLogDialog() {
    return (
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Add New Phone Call Log</DialogTitle>
                <DialogDescription>
                    Fill in the details for the new phone call record.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !null && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            mm/dd/yyyy
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="next-followup" className="text-right">Next Followup Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !null && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            mm/dd/yyyy
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="call-duration" className="text-right">Call Duration</Label>
                    <Input id="call-duration" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="call-type" className="text-right">Call Type</Label>
                     <Select>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="incoming">Incoming</SelectItem>
                            <SelectItem value="outgoing">Outgoing</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="note" className="text-right">Note</Label>
                    <Textarea id="note" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Save</Button>
            </DialogFooter>
        </DialogContent>
    )
}

export default function PhoneCallLogsPage() {
  const [logs, setLogs] = useState<PhoneCallLog[]>(initialLogs);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Staff [Teacher]</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="from-date">FROM DATE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !null && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  mm/dd/yyyy
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="to-date">TO DATE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !null && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  mm/dd/yyyy
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="call-type">CALL TYPE</Label>
            <Select>
              <SelectTrigger id="call-type">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="incoming">Incoming</SelectItem>
                <SelectItem value="outgoing">Outgoing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-start md:col-span-3">
            <Button className="bg-green-500 hover:bg-green-600">Search</Button>
            <Button variant="destructive">Reset</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Phone Call Logs ({logs.length})</CardTitle>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">Add New+</Button>
              </DialogTrigger>
              <AddNewLogDialog />
            </Dialog>
          </div>
          <div className="flex items-center justify-between pt-4">
            <Input placeholder="Search Data...." className="max-w-sm" />
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
              </Button>
              <Button variant="outline" size="icon">
                <FileText className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SR NO.</TableHead>
                <TableHead>ACTION</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>PHONE</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>NEXT FOLLOWUP DATE</TableHead>
                <TableHead>CALL TYPE</TableHead>
                <TableHead>DURATION</TableHead>
                <TableHead>DESCRIPTION</TableHead>
                <TableHead>NOTES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={log.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                  <TableCell>{log.name}</TableCell>
                  <TableCell>{log.phone}</TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.nextFollowupDate}</TableCell>
                  <TableCell>{log.callType}</TableCell>
                  <TableCell>{log.duration}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
