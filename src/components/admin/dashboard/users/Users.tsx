"use client";

import { getDashboard } from "@/api/admin-api";
import { useEffect, useState } from "react";
import { DashboardType } from "../../../../types/types";
import "./style.scss";
import Link from "next/link";
import { IoCaretBack } from "react-icons/io5";

const Users = () => {
  const [data, setData] = useState<DashboardType>();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getDashboard(token ?? "");

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  //console.log("data->", data);

  return (
    <section id="adminUsers">
      <Link href="/dashboard" className="dashLink">
        <IoCaretBack />
        Dashboard
      </Link>
      <div className="card card-user">
        <h4>Users: {!data ? "loading..." : data.userCount}</h4>
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
          data.user
            .filter((user) =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.username.localeCompare(b.username)) // Sort alphabetically
            .map((user, i) => {
              let studentCount = 0;
              if (user.batch.length != 0) {
                user.batch.forEach((batch) => {
                  if (batch.students) studentCount += batch.students.length;
                });
              }

              return (
                <Link href={`/dashboard/users/${user.id}`} key={i}>
                  {i + 1}. {user.username} | B: {user.batch.length} | S:{" "}
                  {studentCount}
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default Users;
