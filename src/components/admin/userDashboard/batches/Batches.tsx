"use client";

import { ping } from "@/api/users-api";
import { useEffect, useState } from "react";
import "@/components/admin/dashboard/batches/style.scss";
import Link from "next/link";
import { IoCaretBack } from "react-icons/io5";

type UserType = {
  data: { isActive: boolean; id: string; name: string; students: {}[] }[];
  user: { username: string };
};
const Batches = () => {
  const [data, setData] = useState<UserType>();
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
  console.log("Dashboard Data ->", data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section id="userBatches">
      <Link href="/user-dashboard" className="dashLink">
        <IoCaretBack />
        Dashboard
      </Link>

      <div className="card card-Batches">
        <h4>Batches: {!data ? "loading..." : data.data.length}</h4>
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
            .filter((batch) =>
              batch.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map((item, i) => {
              return (
                <Link href={`/user-dashboard/batches/${item.id}`} key={i}>
                  {i + 1}. {item.name} | S: {item.students.length} |{" "}
                  {item.isActive ? "Active" : "Inactive"}
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default Batches;
