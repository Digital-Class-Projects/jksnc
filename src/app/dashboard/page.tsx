
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useDatabase } from "@/firebase";
import { useState, useEffect } from "react";
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, FileText, BadgeHelp } from "lucide-react";

const FeeIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 8L12 3L20 8V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H6C5.46957 20 4.96086 19.7893 4.58579 19.4142C4.21071 19.0391 4 18.5304 4 18V8Z"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 20V14H14V20"
      stroke="hsl(var(--primary))"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="7" y="10" width="10" height="4" rx="1" fill="hsl(var(--primary) / 0.1)" />
    <rect x="7" y="10" width="10" height="4" rx="1" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="1" fill="hsl(var(--primary))" />
  </svg>
);

const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#E9F8E9"/>
        <path d="M8 12.5L10.5 15L16 9" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const CrossIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#FFEEEE"/>
        <path d="M15 9L9 15" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9L15 15" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const InquiryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="hsl(var(--primary) / 0.1)"/>
    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 19C18 16.2386 15.3137 14 12 14C8.68629 14 6 16.2386 6 19" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StudentsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.5 8.5C10.8807 8.5 12 7.38071 12 6C12 4.61929 10.8807 3.5 9.5 3.5C8.11929 3.5 7 4.61929 7 6C7 7.38071 8.11929 8.5 9.5 8.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 13.5V18.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12.5 16H16.5" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 11.5C7.29086 11.5 5.5 13.2909 5.5 15.5V18.5H13.5V15.5C13.5 13.2909 11.7091 11.5 9.5 11.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M17 6.5C17.8284 6.5 18.5 5.82843 18.5 5C18.5 4.17157 17.8284 3.5 17 3.5C16.1716 3.5 15.5 4.17157 15.5 5C15.5 5.82843 16.1716 6.5 17 6.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 8.5C14.5 9.88071 15.6193 11 17 11C18.3807 11 19.5 9.88071 19.5 8.5V7.5H14.5V8.5Z" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);


type Branch = {
  id: string;
  name: string;
  totalInquiry: number;
  totalStudent: number;
  totalFee: number;
  collectedFee: number;
  dueFee: number;
  nocApplied: number;
  certificateApplied: number;
  receipts: number;
};


export default function DashboardPage() {
  const database = useDatabase();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);

    const branchesRef = ref(database, "branches");

    const unsubscribe = onValue(branchesRef, (branchSnapshot) => {
      const allBranchData: Promise<Branch>[] = [];

      branchSnapshot.forEach((branchChild) => {
        const branchVal = branchChild.val();
        const branchId = branchChild.key!;
        const branchName = branchVal.name;

        // Create promises to get aggregated data for each branch
        const studentsQuery = query(ref(database, 'students'), orderByChild('branch'), equalTo(branchName));
        const studentsPromise = new Promise<number>((resolve) => {
          onValue(studentsQuery, (studentSnapshot) => {
            resolve(studentSnapshot.size);
          }, { onlyOnce: true });
        });
        
        const inquiriesQuery = query(ref(database, 'admissionEnquiries'), orderByChild('branch'), equalTo(branchName));
        const inquiriesPromise = new Promise<number>((resolve) => {
          onValue(inquiriesQuery, (inquirySnapshot) => {
            resolve(inquirySnapshot.size);
          }, { onlyOnce: true });
        });
        
        const nocAppliedPromise = new Promise<number>((resolve) => {
          onValue(ref(database, 'nocApplications'), (snapshot) => {
             // In a real scenario, you'd filter by branch
            resolve(snapshot.size);
          }, { onlyOnce: true });
        });

        const certificateAppliedPromise = new Promise<number>((resolve) => {
          onValue(ref(database, 'certificateApplications'), (snapshot) => {
             // In a real scenario, you'd filter by branch
            resolve(snapshot.size);
          }, { onlyOnce: true });
        });

        const receiptsPromise = new Promise<number>((resolve) => {
            const receiptsQuery = query(ref(database, 'feeReceipts'), orderByChild('status'), equalTo('pending'));
             onValue(receiptsQuery, (snapshot) => {
                // In a real scenario, you might filter by branch if receipts are linked
                resolve(snapshot.size);
            }, { onlyOnce: true});
        });

        const branchDataPromise = Promise.all([
          studentsPromise, 
          inquiriesPromise, 
          nocAppliedPromise, 
          certificateAppliedPromise,
          receiptsPromise,
        ])
          .then(([totalStudent, totalInquiry, nocApplied, certificateApplied, receipts]) => {
            // Fee calculation can be added here once fee data is available
            const totalFee = totalStudent * 12000; // Mock fee
            const collectedFee = totalStudent * 9000; // Mock fee
            const dueFee = totalFee - collectedFee;

            return {
              id: branchId,
              name: branchName,
              totalInquiry,
              totalStudent,
              totalFee,
              collectedFee,
              dueFee,
              nocApplied,
              certificateApplied,
              receipts
            };
          });

        allBranchData.push(branchDataPromise);
      });
      
      Promise.all(allBranchData).then(results => {
          setBranches(results);
          setIsLoading(false);
      })
    });

    return () => unsubscribe();
  }, [database]);


  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-md">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              <span role="img" aria-label="waving hand" className="mr-2">
                👋
              </span>
              Welcome, JKSNC
            </h2>
            <p className="text-muted-foreground">
              Every morning is a blank canvas... it is whatever you make out of
              it.
            </p>
          </div>
          <div className="hidden md:block">
            <Image
              src="https://picsum.photos/seed/welcome-dashboard/180/120"
              alt="Welcome Illustration"
              width={180}
              height={120}
              className="rounded-lg"
              data-ai-hint="office person working"
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-4">Financial Analysis</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
               <FeeIcon />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{branches.reduce((sum, b) => sum + b.totalFee, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Collected Fee
              </CardTitle>
              <CheckIcon />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{branches.reduce((sum, b) => sum + b.collectedFee, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Fee</CardTitle>
              <CrossIcon />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{branches.reduce((sum, b) => sum + b.dueFee, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Branch Details</h3>
        {isLoading ? (
          <div className="space-y-4">
             <Skeleton className="h-48 w-full" />
             <Skeleton className="h-48 w-full" />
          </div>
        ) : branches.length > 0 ? (
          <div className="space-y-6">
            {branches.map(branch => (
              <Card key={branch.id} className="shadow-md">
                <CardHeader>
                    <CardTitle>{branch.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inquiry</CardTitle>
                            <InquiryIcon />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.totalInquiry}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Student</CardTitle>
                            <StudentsIcon />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.totalStudent}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">NOC Applied</CardTitle>
                            <FileText className="h-6 w-6 text-yellow-600"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.nocApplied}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Certificate Applied</CardTitle>
                            <Award className="h-6 w-6 text-green-600"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.certificateApplied}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Receipts</CardTitle>
                            <BadgeHelp className="h-6 w-6 text-blue-600"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.receipts}</div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
            ))}
          </div>
        ) : (
            <Card className="shadow-md">
                <CardContent className="p-6 text-center text-muted-foreground">
                    No branches found. Add a branch to see details here.
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
