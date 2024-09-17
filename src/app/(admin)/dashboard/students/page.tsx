"use client";

import { getAllStudents } from "@/api/admin-api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCaretBack } from "react-icons/io5";
import "@/components/admin/dashboard/users/user/batch/style.scss";

type Students = {
  student: {
    id: string;
    name: string;
    aaadhar_number: string;
    batch: { name: string };
  }[];
};

const page = () => {
  const [data, setData] = useState<Students>();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getAllStudents(token ?? "");

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  //console.log("students->", data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  return (
    <section id="adminbatch">
      <div className="links">
        <Link href="/dashboard" className="dashLink">
          <IoCaretBack />
          Dashboard
        </Link>
      </div>
      <div className="card ">
        <h4>
          {!data
            ? "loading..."
            : `Students: ${data.student ? data.student.length : 0}`}
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
          data.student
            .filter((student) =>
              student.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map((b, i) => {
              return (
                <Link href="" key={i}>
                  {i + 1}. {b.name} | {b.batch.name} <span>S: (today)</span>
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default page;
