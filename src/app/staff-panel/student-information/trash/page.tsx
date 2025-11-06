
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon, FileSpreadsheet, FileText } from "lucide-react";

type TrashedStudent = {
  id: string;
  date: string;
  admissionNo: string;
  rollNo: string;
  course: string;
  name: string;
  mobile: string;
};

const initialTrashedStudents: TrashedStudent[] = []; // Initially empty

export default function TrashAdmissionPage() {
  const [trashedStudents, setTrashedStudents] = useState<TrashedStudent[]>(initialTrashedStudents);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Staff [Teacher]</h1>
      <Card>
        <CardHeader>
          <CardTitle>Select Criteria</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="from-date">FROM DATE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  mm/dd/yyyy
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="to-date">TO DATE</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !null && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  mm/dd/yyyy
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0"><Calendar mode="single" initialFocus /></PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <Label htmlFor="class">CLASS</Label>
            <Select>
              <SelectTrigger id="class"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="class-a">Class A</SelectItem>
                <SelectItem value="class-b">Class B</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="section">SECTION</Label>
            <Select>
              <SelectTrigger id="section"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="section-1">Section 1</SelectItem>
                <SelectItem value="section-2">Section 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 justify-start md:col-span-4">
            <Button variant="destructive">Reset</Button>
            <Button>Search</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Trash Admission List ({trashedStudents.length})</CardTitle>
          <div className="flex items-center justify-between pt-4">
            <Input placeholder="Search Data...." className="max-w-sm" />
            <div className="flex gap-2">
              <Button variant="outline" size="icon"><FileSpreadsheet className="h-4 w-4 text-green-600" /></Button>
              <Button variant="outline" size="icon"><FileText className="h-4 w-4 text-red-600" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SR NO.</TableHead>
                <TableHead>RESTORE</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>ADMISSION NO.</TableHead>
                <TableHead>ROLL NO.</TableHead>
                <TableHead>CLASS/COURSE</TableHead>
                <TableHead>NAME</TableHead>
                <TableHead>MOBILE</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trashedStudents.length > 0 ? (
                trashedStudents.map((student, index) => (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">Restore</Button>
                    </TableCell>
                    <TableCell>{student.date}</TableCell>
                    <TableCell>{student.admissionNo}</TableCell>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>{student.course}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.mobile}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center h-24">
                    No records found in the trash.
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
