"use client";

import { getAllStudentsBybatch, ping } from "@/api/users-api";
import "@/components/admin/dashboard/users/user/batch/style.scss";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCaretBack } from "react-icons/io5";

type Student = {
  id: number;
  status: string;
  batchId: string;
  aadhar_number: string;
  name: string;
};

type Batch = {
  data: {
    id: string;
    students: {
      aadhar_number: string;
      name: string;
      status: string;
    }[];
  }[];
};

const Students = () => {
  const [data, setData] = useState<Batch>();
  const [searchTerm, setSearchTerm] = useState("");
  const [studentsData, setStudentData] = useState<Student[]>([]);
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await ping(token ?? "");

      //const students = await getAllStudentsBybatch(token ?? "", batchId);

      //setStudentData(students);

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchAllStudentsByBatch = async () => {
    if (!data) return;
    const token = localStorage.getItem("token");

    try {
      const students = await Promise.all(
        data.data.map(async (batch) => {
          const batchStudents = await getAllStudentsBybatch(
            token ?? "",
            batch.id
          );
          return batchStudents;
        })
      );

      setStudentData(students.flat()); // Flatten the array of arrays
    } catch (error) {
      console.error("Error fetching students data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (data) {
      fetchAllStudentsByBatch();
    }
  }, [data]);

  //console.log("students->", data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getStudentStatus = (batchId: string, aadhar_number: string) => {
    const student = studentsData.find(
      (s) => s.batchId === batchId && s.aadhar_number === aadhar_number
    );
    return student?.status || "Unknown";
  };

  return (
    <section id="userStudents">
      <div className="links">
        <Link href="/user-dashboard" className="dashLink">
          <IoCaretBack />
          Dashboard
        </Link>
      </div>
      <div className="card ">
        <h4>
          Students:{" "}
          {!data
            ? "loading..."
            : `${data.data.reduce(
                (partialSum, a) => partialSum + a.students.length,
                0
              )} | In: ${
                studentsData.filter(
                  (student) => student.status === "Present-not-out"
                ).length
              } | Out: ${
                studentsData.filter(
                  (student) => student.status === "Present-with-out"
                ).length
              } | A: ${
                studentsData.filter((student) => student.status === "Absent")
                  .length
              }`}
        </h4>
        <input
          type="text"
          placeholder="Search by username..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="search-input"
        />
        <div className="line" />
        {!data ? (
          <p>loading...</p>
        ) : (
          data.data
            .flatMap((a) =>
              a.students.map((student) => ({ ...student, batchId: a.id }))
            )
            .filter((student) =>
              student.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map((student, i) => {
              const studentStatus = getStudentStatus(
                student.batchId,
                student.aadhar_number
              );
              return (
                <Link href="" key={i}>
                  {i + 1}. {student.name} | A: {student.aadhar_number}{" "}
                  <span> {studentStatus}</span>
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default Students;
