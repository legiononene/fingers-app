"use client";

import { ping } from "@/api/users-api";
import "@/components/admin/dashboard/users/user/batch/style.scss";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCaretBack } from "react-icons/io5";

type Students = {
  data: [
    { students: [{ aadhar_number: string; name: string; status: string }] }
  ];
};

const Students = () => {
  const [data, setData] = useState<Students>();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await ping(token ?? "");

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
            : data.data.reduce(
                (partialSum, a) => partialSum + a.students.length,
                0
              )}
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
            .flatMap((a) => a.students)
            .filter((name) =>
              name.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map((b, i) => {
              return (
                <Link href="" key={i}>
                  {i + 1}. {b.name} | A: {b.aadhar_number}{" "}
                  <span>S: (Today)</span>
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default Students;
