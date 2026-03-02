"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  User,
  Download,
  Printer,
  Calendar,
  CreditCard,
  FileText,
  GraduationCap,
  X,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  classId: string;
  className: string;
  status: string;
  fatherName: string;
  motherName: string;
  guardianPhone: string;
  address?: string;
}

interface StudentSearchResult {
  students: Student[];
}

interface AttendanceRecord {
  date: string;
  status: string;
}

interface FeeRecord {
  id: string;
  title: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface GradeRecord {
  subjectName: string;
  score: number;
  letterGrade: string;
}

interface StudentDetailProps {
  institutionId: string;
}

export function StudentSearchWidget({ institutionId }: StudentDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Student details
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function searchStudents(query: string) {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/v1/students/search?q=${encodeURIComponent(query)}&limit=10`,
      );
      const json = await res.json();
      setSearchResults(json.data || []);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function loadStudentDetails(student: Student) {
    setSelectedStudent(student);
    setShowResults(false);
    setLoadingDetails(true);

    try {
      const [attRes, feeRes, gradeRes] = await Promise.all([
        fetch(`/api/v1/students/${student.id}/attendance?limit=30`),
        fetch(`/api/v1/students/${student.id}/fees`),
        fetch(`/api/v1/students/${student.id}/grades`),
      ]);

      const attJson = await attRes.json();
      const feeJson = await feeRes.json();
      const gradeJson = await gradeRes.json();

      setAttendance(attJson.data?.records || []);
      setFees(feeJson.data || []);
      setGrades(gradeJson.data || []);
    } catch (error) {
      console.error("Error loading student details:", error);
    } finally {
      setLoadingDetails(false);
    }
  }

  function printStudentDetails() {
    if (!selectedStudent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const attendanceHtml = attendance
      .slice(0, 10)
      .map(
        (a) => `
      <tr>
        <td>${new Date(a.date).toLocaleDateString()}</td>
        <td>${a.status}</td>
      </tr>
    `,
      )
      .join("");

    const feesHtml = fees
      .map(
        (f) => `
      <tr>
        <td>${f.title}</td>
        <td>৳${f.amount}</td>
        <td>${f.status}</td>
      </tr>
    `,
      )
      .join("");

    const gradesHtml = grades
      .map(
        (g) => `
      <tr>
        <td>${g.subjectName}</td>
        <td>${g.score}</td>
        <td>${g.letterGrade}</td>
      </tr>
    `,
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Report - ${selectedStudent.firstName} ${selectedStudent.lastName}</title>
        <style>
          body { font-family: 'Hind Siliguri', Arial, sans-serif; padding: 20px; }
          h1 { color: #006A4E; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #006A4E; color: white; }
          .section { margin: 20px 0; }
          .header { display: flex; justify-content: space-between; align-items: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ধাদাশ সরকারি প্রাথমিক বিদ্যালয়</h1>
          <p>Student Report</p>
        </div>
        
        <div class="section">
          <h2>Student Information</h2>
          <p><strong>Name:</strong> ${selectedStudent.firstName} ${selectedStudent.lastName}</p>
          <p><strong>Student ID:</strong> ${selectedStudent.studentId}</p>
          <p><strong>Class:</strong> ${selectedStudent.className}</p>
          <p><strong>Status:</strong> ${selectedStudent.status}</p>
          <p><strong>Father:</strong> ${selectedStudent.fatherName}</p>
          <p><strong>Mother:</strong> ${selectedStudent.motherName}</p>
        </div>

        <div class="section">
          <h2>Attendance (Last 10 Days)</h2>
          <table>
            <tr><th>Date</th><th>Status</th></tr>
            ${attendanceHtml}
          </table>
        </div>

        <div class="section">
          <h2>Fee Status</h2>
          <table>
            <tr><th>Title</th><th>Amount</th><th>Status</th></tr>
            ${feesHtml}
          </table>
        </div>

        <div class="section">
          <h2>Grades</h2>
          <table>
            <tr><th>Subject</th><th>Score</th><th>Grade</th></tr>
            ${gradesHtml}
          </table>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          শিক্ষার্থী অনুসন্ধান
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search Input */}
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="শিক্ষার্থীর নাম বা আইডি খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchResults([]);
                  setSelectedStudent(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-background shadow-xl max-h-60 overflow-y-auto">
              {searchResults.map((student) => (
                <button
                  key={student.id}
                  onClick={() => loadStudentDetails(student)}
                  className="flex items-center gap-3 w-full p-3 hover:bg-muted text-left"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {student.studentId} • {student.className}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Student Details */}
        {selectedStudent && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.studentId} • {selectedStudent.className}
                  </p>
                  <Badge
                    variant={
                      selectedStudent.status === "ACTIVE"
                        ? "default"
                        : "secondary"
                    }
                    className="mt-1"
                  >
                    {selectedStudent.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={printStudentDetails}
                >
                  <Printer className="h-4 w-4 mr-1" /> প্রিন্ট
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/dashboard/students/${selectedStudent.id}`}>
                    <Eye className="h-4 w-4 mr-1" /> বিস্তারিত
                  </Link>
                </Button>
              </div>
            </div>

            {loadingDetails ? (
              <div className="text-center py-4 text-muted-foreground">
                লোড হচ্ছে...
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Attendance */}
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">উপস্থিতি</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">মোট:</span>
                      <span className="font-medium">
                        {attendance.length} দিন
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">উপস্থিত:</span>
                      <span className="font-medium text-green-600">
                        {
                          attendance.filter((a) => a.status === "PRESENT")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">অনুপস্থিত:</span>
                      <span className="font-medium text-red-600">
                        {attendance.filter((a) => a.status === "ABSENT").length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fees */}
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-sm">ফি</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">মোট:</span>
                      <span className="font-medium">
                        ৳
                        {fees
                          .reduce((sum, f) => sum + Number(f.amount), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">পরিশোধ:</span>
                      <span className="font-medium text-green-600">
                        ৳
                        {fees
                          .filter((f) => f.status === "PAID")
                          .reduce((sum, f) => sum + Number(f.amount), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">বকেয়া:</span>
                      <span className="font-medium text-amber-600">
                        ৳
                        {fees
                          .filter((f) => f.status !== "PAID")
                          .reduce((sum, f) => sum + Number(f.amount), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grades */}
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-sm">গ্রেড</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">সাবজেক্ট:</span>
                      <span className="font-medium">{grades.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">গড়:</span>
                      <span className="font-medium">
                        {grades.length > 0
                          ? Math.round(
                              grades.reduce((sum, g) => sum + g.score, 0) /
                                grades.length,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">সেরা:</span>
                      <span className="font-medium text-green-600">
                        {grades.length > 0
                          ? Math.max(...grades.map((g) => g.score))
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
