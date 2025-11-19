
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useDatabase } from "@/firebase";
import { useState, useEffect } from "react";
import { ref, onValue, query, orderByChild, equalTo, get } from "firebase/database";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, FileText, BadgeHelp, Users, FileSignature, Receipt, Megaphone } from "lucide-react";

type BranchStats = {
  id: string;
  name: string;
  totalInquiry: number;
  totalStudent: number;
  totalFee: number;
  collectedFee: number;
  dueFee: number;
  nocApplied: number;
  certificateApplied: number;
  pendingReceipts: number;
};


export default function DashboardPage() {
  const database = useDatabase();
  const [branchStats, setBranchStats] = useState<BranchStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) return;
    setIsLoading(true);

    const branchesRef = ref(database, "branches");

    const unsubscribe = onValue(branchesRef, (branchSnapshot) => {
      const promises: Promise<BranchStats>[] = [];

      branchSnapshot.forEach((branchChild) => {
        const branchId = branchChild.key!;
        const branchName = branchChild.val().name;

        const statPromise = new Promise<BranchStats>(async (resolve) => {
          const [
            studentSnapshot,
            inquirySnapshot,
            nocSnapshot,
            certSnapshot,
            receiptSnapshot,
          ] = await Promise.all([
            get(query(ref(database, 'students'), orderByChild('branchId'), equalTo(branchId))),
            get(query(ref(database, 'enquiries'), orderByChild('branchId'), equalTo(branchId))),
            get(query(ref(database, `applications/noc`))),
            get(query(ref(database, `applications/certificates`))),
            get(query(ref(database, 'feeReceipts'))),
          ]);
          
          const totalStudent = studentSnapshot.size;
          
          let nocApplied = 0;
          if (nocSnapshot.exists()) {
            nocSnapshot.forEach(studentNode => {
              studentNode.forEach(appNode => {
                const appData = appNode.val();
                if (appData.branchId === branchId && appData.status === 'Pending') {
                  nocApplied++;
                }
              });
            });
          }

          let certificateApplied = 0;
          if (certSnapshot.exists()) {
            certSnapshot.forEach(studentNode => {
              studentNode.forEach(appNode => {
                const appData = appNode.val();
                if (appData.branchId === branchId && appData.status === 'Pending') {
                  certificateApplied++;
                }
              });
            });
          }
          
          const studentIdsInBranch = new Set<string>();
          studentSnapshot.forEach(student => {
            studentIdsInBranch.add(student.val().uid);
          });
          
          let pendingReceipts = 0;
          if (receiptSnapshot.exists()) {
            receiptSnapshot.forEach(receipt => {
              const receiptData = receipt.val();
              if (studentIdsInBranch.has(receiptData.studentId) && receiptData.status === 'pending') {
                pendingReceipts++;
              }
            });
          }

          const totalFee = totalStudent * 12000;
          const collectedFee = totalStudent * 9000;

          resolve({
            id: branchId,
            name: branchName,
            totalStudent: totalStudent,
            totalInquiry: inquirySnapshot.size,
            nocApplied: nocApplied,
            certificateApplied: certificateApplied,
            pendingReceipts: pendingReceipts,
            totalFee: totalFee,
            collectedFee: collectedFee,
            dueFee: totalFee - collectedFee,
          });
        });

        promises.push(statPromise);
      });

      Promise.all(promises).then((results) => {
        setBranchStats(results);
        setIsLoading(false);
      });
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
              Welcome
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
        <h3 className="text-xl font-semibold mb-4">Financial Overview</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fee</CardTitle>
               <Receipt className="h-5 w-5 text-green-500"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{branchStats.reduce((sum, b) => sum + b.totalFee, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Collected Fee
              </CardTitle>
              <BadgeHelp className="h-5 w-5 text-blue-500"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{branchStats.reduce((sum, b) => sum + b.collectedFee, 0).toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Fee</CardTitle>
              <FileText className="h-5 w-5 text-red-500"/>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{branchStats.reduce((sum, b) => sum + b.dueFee, 0).toLocaleString()}</div>
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
        ) : branchStats.length > 0 ? (
          <div className="space-y-6">
            {branchStats.map(branch => (
              <Card key={branch.id} className="shadow-md">
                <CardHeader>
                    <CardTitle>{branch.name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Inquiry</CardTitle>
                            <Megaphone className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.totalInquiry}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Student</CardTitle>
                            <Users className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.totalStudent}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending NOC Apps</CardTitle>
                            <FileSignature className="h-5 w-5 text-yellow-600"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.nocApplied}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Certificate Apps</CardTitle>
                            <Award className="h-5 w-5 text-green-600"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.certificateApplied}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Receipts</CardTitle>
                            <Receipt className="h-5 w-5 text-indigo-600"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{branch.pendingReceipts}</div>
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
