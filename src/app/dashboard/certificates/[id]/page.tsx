
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDatabase } from "@/firebase";
import { ref, onValue } from "firebase/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import html2canvas from "html2canvas";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type CertificateData = {
  studentName: string;
  fatherName: string;
  courseName: string;
  session: string;
  rollNo: string;
  enrollmentNo: string;
  marksPercentage: string;
  issueDate: string;
  certificateType: string;
  certificateDetails?: any;
  grade?: string;
  maxMarksTheory?: string;
  obtainedMarksTheory?: string;
  maxMarksPractical?: string;
  obtainedMarksPractical?: string;
  totalMarksTheory?: string;
  totalMarksPractical?: string;
  resultTheory?: string;
  resultPractical?: string;
  marksInWords?: string;
  preparedBy?: string;
  checkedBy?: string;
  photoUrl?: string;
  dateFrom?: string;
  dateTo?: string;
  teacherName?: string;
  instituteName?: string;
  instituteLogoUrl?: string;
  certificateNo?: string;
  passingYear?: string;
};

const certificateTemplates: { [key: string]: string } = {
  "Registration Certificate": "https://ik.imagekit.io/rgazxzsxr/Registration%20Certificate.png?updatedAt=1761992685429",
  "Marks Certificate": "https://ik.imagekit.io/rgazxzsxr/marks%20cards%20and%20registration%20CURVE%20FILE.png?updatedAt=1761988197015",
  "Migration Certificate": "https://ik.imagekit.io/rgazxzsxr/Migration%20Certifiate.png?updatedAt=1760612547767",
  "Diploma Certificate": "https://ik.imagekit.io/rgazxzsxr/Diploma%20Certificate.png?updatedAt=1761715718990",
};


export default function CertificatePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const database = useDatabase();
  const { toast } = useToast();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef(null);

  const certificateId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!database || !certificateId) {
        setIsLoading(false);
        if(!certificateId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Certificate ID is missing.' });
        }
        return;
    }
    const certRef = ref(database, `generatedCertificates/${certificateId}`);
    const unsubscribe = onValue(certRef, (snapshot) => {
        if (snapshot.exists()) {
            setCertificate(snapshot.val());
        } else {
             toast({ variant: 'destructive', title: 'Not Found', description: 'Could not find the requested certificate.' });
        }
        setIsLoading(false);
    });
    return () => unsubscribe();
  }, [database, certificateId, toast]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
        const canvas = await html2canvas(certificateRef.current, {
            scale: 4, 
            useCORS: true,
            backgroundColor: null,
            logging: true,
        });
        const link = document.createElement('a');
        link.download = `${certificate?.studentName}_${certificate?.certificateType}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    } catch (error) {
        console.error("Error generating image:", error);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the certificate image.' });
    } finally {
        setIsDownloading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Skeleton className="w-[794px] h-[1123px]" /></div>;
  }

  if (!certificate) {
    return <div className="p-8 text-center">Certificate not found.</div>;
  }

  const findTemplateUrl = (type: string) => {
    if (!type) return "https://placehold.co/794x1123/eee/ccc?text=Template+Not+Found";
    const key = Object.keys(certificateTemplates).find(k => type.toLowerCase().includes(k.split(' ')[0].toLowerCase()));
    return key ? certificateTemplates[key] : "https://placehold.co/794x1123/eee/ccc?text=Template+Not+Found";
  };

  const templateUrl = findTemplateUrl(certificate.certificateType);
  
  const isDiploma = certificate.certificateType.includes("Diploma");
  const isMigration = certificate.certificateType.includes("Migration");
  const isRegistration = certificate.certificateType.includes("Registration");
  const isMarks = certificate.certificateType.includes("Marks");
  
  const isLandscape = isRegistration;


  return (
    <div className="p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>Certificate Preview</CardTitle>
                <CardDescription>Review the certificate before downloading.</CardDescription>
            </div>
            <div className="flex gap-2">
                 <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download PNG
                </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center bg-gray-100 p-8">
            <div 
                ref={certificateRef} 
                className={cn(
                    "relative overflow-hidden shadow-lg",
                    isLandscape ? "w-[1123px] h-[794px]" : "w-[794px] h-[1123px]"
                )}
                style={{
                    backgroundImage: `url(${templateUrl})`,
                    backgroundSize: '100% 100%',
                }}
            >
                {isDiploma && (
                    <>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '220px', right: '80px', fontSize: '18px' }}>{certificate.enrollmentNo}</div>
                        <div className="absolute font-bold font-['Times_New_Roman'] text-center w-full" style={{ top: '285px', fontSize: '32px' }}>{certificate.studentName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-medium text-center w-full" style={{ top: '325px', fontSize: '22px' }}>{certificate.fatherName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-medium" style={{ top: '385px', left: '230px', fontSize: '20px' }}>{certificate.courseName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-medium" style={{ top: '420px', left: '210px', fontSize: '20px' }}>{certificate.certificateDetails?.branchName || 'Govt. Medical College, Srinagar'}</div>
                        <div className="absolute font-['Times_New_Roman'] font-medium" style={{ top: '455px', left: '270px', fontSize: '20px' }}>{certificate.session}</div>
                        <div className="absolute font-bold font-['Times_New_Roman']" style={{ top: '490px', right: '150px', fontSize: '22px' }}>{certificate.grade}</div>
                        <div className="absolute font-['Times_New_Roman'] font-medium" style={{ top: '490px', left: '130px', fontSize: '20px' }}>{certificate.rollNo}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '530px', left: '580px', fontSize: '18px' }}>{new Date(certificate.issueDate).toLocaleDateString('en-GB')}</div>
                        {certificate.photoUrl && <img src={certificate.photoUrl} className="absolute object-cover border-2 border-black" style={{ top: '600px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '120px' }} alt="student" crossOrigin="anonymous" />}
                    </>
                )}
                
                {isMigration && (
                     <>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '190px', left: '80px', fontSize: '14px' }}>{certificate.certificateNo}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '262px', left: '350px', fontSize: '20px' }}>{certificate.studentName}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '298px', left: '350px', fontSize: '20px' }}>{certificate.fatherName}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '333px', left: '320px', fontSize: '20px' }}>{certificate.courseName}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '333px', right: '150px', fontSize: '20px' }}>{certificate.passingYear}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '370px', left: '250px', fontSize: '20px' }}>{certificate.rollNo}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '405px', left: '690px', fontSize: '16px' }}>{new Date(certificate.issueDate).toLocaleDateString('en-GB')}</div>
                     </>
                )}

                 {isRegistration && (
                    <>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '255px', left: '320px', fontSize: '22px' }}>{certificate.enrollmentNo}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '305px', left: '320px', fontSize: '22px' }}>{certificate.studentName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '355px', left: '320px', fontSize: '22px' }}>{certificate.fatherName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '405px', left: '320px', fontSize: '22px' }}>{certificate.courseName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '455px', left: '320px', fontSize: '22px' }}>{certificate.session}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '505px', left: '320px', fontSize: '22px' }}>{certificate.instituteName}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '555px', left: '320px', fontSize: '22px' }}>{certificate.teacherName}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ bottom: '180px', left: '150px', fontSize: '16px' }}>{new Date(certificate.issueDate).toLocaleDateString('en-GB')}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ bottom: '130px', left: '150px', fontSize: '16px' }}>{certificate.dateFrom ? new Date(certificate.dateFrom).toLocaleDateString('en-GB') : ''}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ bottom: '130px', left: '300px', fontSize: '16px' }}>{certificate.dateTo ? new Date(certificate.dateTo).toLocaleDateString('en-GB') : ''}</div>
                        {certificate.photoUrl && <img src={certificate.photoUrl} className="absolute object-cover" style={{ top: '154px', right: '144px', width: '128px', height: '148px', paddingTop: '4px' }} alt="student" crossOrigin="anonymous" />}
                        {certificate.instituteLogoUrl && <img src={certificate.instituteLogoUrl} className="absolute object-contain" style={{ top: '80px', left: '130px', width: '150px', height: '100px' }} alt="institute logo" crossOrigin="anonymous" />}
                    </>
                )}

                {isMarks && (
                     <>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '250px', left: '200px', fontSize: '16px' }}>{certificate.rollNo}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '270px', left: '200px', fontSize: '16px' }}>{certificate.studentName}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '290px', left: '200px', fontSize: '16px' }}>{certificate.courseName}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '382px', left: '475px', fontSize: '14px' }}>{certificate.maxMarksTheory}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '404px', left: '475px', fontSize: '14px' }}>{certificate.obtainedMarksTheory}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '425px', left: '475px', fontSize: '14px' }}>{certificate.resultTheory}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '382px', left: '600px', fontSize: '14px' }}>{certificate.maxMarksPractical}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '404px', left: '600px', fontSize: '14px' }}>{certificate.obtainedMarksPractical}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '425px', left: '600px', fontSize: '14px' }}>{certificate.resultPractical}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '448px', left: '475px', fontSize: '14px' }}>{certificate.totalMarksTheory}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '448px', left: '600px', fontSize: '14px' }}>{certificate.totalMarksPractical}</div>
                        <div className="absolute font-['Times_New_Roman'] font-bold" style={{ top: '525px', left: '300px', fontSize: '16px' }}>{certificate.marksPercentage}%</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ top: '560px', left: '150px', fontSize: '14px', width: '500px' }}>{certificate.marksInWords}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ bottom: '200px', left: '150px', fontSize: '14px' }}>{certificate.preparedBy}</div>
                        <div className="absolute font-['Times_New_Roman']" style={{ bottom: '200px', right: '150px', fontSize: '14px' }}>{certificate.checkedBy}</div>
                     </>
                )}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
