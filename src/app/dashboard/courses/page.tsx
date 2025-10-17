
"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";
import { useDatabase } from "@/firebase";
import { ref, push, onValue, update, remove, set } from "firebase/database";
import { FileDown, Copy, FileText, FileSpreadsheet, Edit, Trash2 } from "lucide-react";

const RequiredIndicator = () => <span className="text-destructive">*</span>;

type Course = {
  id: string;
  courseImage: string;
  courseName: string;
  courseType: string;
  description: string;
  language: string;
  certificate: string;
  sellingPrice: string;
  discount: string;
  show: boolean;
};

export default function CoursePage() {
  const database = useDatabase();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseImage, setCourseImage] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseType, setCourseType] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [certificate, setCertificate] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 10;


  useEffect(() => {
    if (!database) return;
    const coursesRef = ref(database, 'courses');
    const unsubscribe = onValue(coursesRef, (snapshot) => {
      const coursesList: Course[] = [];
      snapshot.forEach(childSnapshot => {
        coursesList.push({
          id: childSnapshot.key!,
          ...childSnapshot.val()
        });
      });
      setCourses(coursesList);
    });

    return () => unsubscribe();
  }, [database]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!database || !courseName || !courseType || !description || !language || !certificate || !sellingPrice) {
        // Or show a toast message
        alert("Please fill all required fields.");
        return;
    }
    const newCourse = {
      courseImage,
      courseName,
      courseType,
      description,
      language,
      certificate,
      sellingPrice,
      discount,
      show: true,
    };
    try {
      const coursesRef = ref(database, 'courses');
      const newCourseRef = push(coursesRef);
      await set(newCourseRef, newCourse);
      setShowSuccessDialog(true);
      // Reset form
      setCourseImage("");
      setCourseName("");
      setCourseType("");
      setDescription("");
      setLanguage("");
      setCertificate("");
      setSellingPrice("");
      setDiscount("");
    } catch (error) {
      console.error("Error adding course: ", error);
      alert("Error adding course: " + (error as Error).message);
    }
  };
  
  const handleToggleShow = async (courseId: string, currentShowState: boolean) => {
    if (!database) return;
    const courseRef = ref(database, `courses/${courseId}`);
    await update(courseRef, { show: !currentShowState });
  };

  const handleDelete = async (courseId: string) => {
    if (!database) return;
    const courseRef = ref(database, `courses/${courseId}`);
    await remove(courseRef);
  };

  // Pagination logic
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentCourses = courses.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(courses.length / entriesPerPage);

  const handlePrevPage = () => {
    setCurrentPage(prev => (prev > 1 ? prev - 1 : prev));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev < totalPages ? prev + 1 : prev));
  };


  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} id="add-course-form" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="course-image">
                COURSE IMAGE <RequiredIndicator />
              </Label>
              <div className="flex items-center gap-2">
                <Input id="course-image" type="file" className="max-w-xs" onChange={(e) => setCourseImage(e.target.value)} value={courseImage} />
              </div>
              <p className="text-sm text-muted-foreground">
                Perfect size: 400x600(Px)
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="course-name">
                  COURSE OR SUBJECT NAME <RequiredIndicator />
                </Label>
                <Input id="course-name" placeholder="" required onChange={(e) => setCourseName(e.target.value)} value={courseName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-type">
                  COURSE TYPE <RequiredIndicator />
                </Label>
                <Input id="course-type" required value={courseType} onChange={(e) => setCourseType(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course-description">
                FULL OVERVIEW OR DESCRIPTION <RequiredIndicator />
              </Label>
              <Textarea id="course-description" required rows={4} onChange={(e) => setDescription(e.target.value)} value={description} />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="language">
                  LANGUAGE <RequiredIndicator />
                </Label>
                <Input id="language" required placeholder="" onChange={(e) => setLanguage(e.target.value)} value={language} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate-completion">
                  WANT TO PROVIDE CERTIFICATE OF COMPLETION ?{" "}
                  <RequiredIndicator />
                </Label>
                <Select onValueChange={setCertificate} value={certificate} required>
                  <SelectTrigger id="certificate-completion">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="selling-price">
                  SELLING PRICE <RequiredIndicator />
                </Label>
                <Input id="selling-price" required type="number" placeholder="" onChange={(e) => setSellingPrice(e.target.value)} value={sellingPrice} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">
                  DISCOUNT (%) <span className="text-green-600">(OPTIONAL)</span>
                </Label>
                <Input id="discount" type="number" placeholder="" onChange={(e) => setDiscount(e.target.value)} value={discount} />
              </div>
            </div>

            <div className="flex justify-end">
                <Button type="submit">Submit</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Courses List</CardTitle>
            <div className="flex items-center gap-2">
               <Input placeholder="Search..." className="w-64" />
               <Button variant="ghost" size="icon"><FileText className="h-5 w-5 text-red-500" /></Button>
               <Button variant="ghost" size="icon"><FileSpreadsheet className="h-5 w-5 text-green-500" /></Button>
               <Button variant="ghost" size="icon"><FileDown className="h-5 w-5 text-blue-500" /></Button>
               <Button variant="ghost" size="icon"><Copy className="h-5 w-5" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>COURSE NAME</TableHead>
                <TableHead>COURSE PRICE</TableHead>
                <TableHead>SHOW/HIDE</TableHead>
                <TableHead>COURSE TYPE</TableHead>
                <TableHead>ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCourses.length > 0 ? currentCourses.map((course, index) => (
                <TableRow key={course.id}>
                  <TableCell>{indexOfFirstEntry + index + 1}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>₹{course.sellingPrice}</TableCell>
                  <TableCell>
                    <Switch checked={course.show} onCheckedChange={() => handleToggleShow(course.id, course.show)} />
                  </TableCell>
                  <TableCell>{course.courseType}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="icon" className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-destructive border-destructive hover:bg-destructive hover:text-white" onClick={() => handleDelete(course.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No courses found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                  Showing {courses.length > 0 ? indexOfFirstEntry + 1 : 0} to {Math.min(indexOfLastEntry, courses.length)} of {courses.length} entries
              </div>
              {courses.length > entriesPerPage && (
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-sm font-medium">{currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              New course has been added successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
