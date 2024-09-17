"use client";

import { getStudentsBybatch } from "@/api/admin-api";
import { Batches } from "@/types/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCaretBack } from "react-icons/io5";
import "@/components/admin/dashboard/users/user/batch/style.scss";

const Students = ({ slug }: { slug: string }) => {
  const [data, setData] = useState<{ batch: Batches }>();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getStudentsBybatch(slug, token ?? "");

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
        <Link href="/dashboard/batches/" className="dashLink">
          <IoCaretBack />
          Batches
        </Link>
      </div>
      <div className="card card-batch">
        <h4>
          {!data
            ? "loading..."
            : `${data.batch.name}: ${
                data.batch.students ? data.batch.students.length : 0
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
          data.batch.students &&
          data.batch.students
            .filter((student) =>
              student.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map((b, i) => {
              return (
                <Link href="" key={i}>
                  {i + 1}. {b.name} <span>S: {b.status} (today)</span>
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default Students;
