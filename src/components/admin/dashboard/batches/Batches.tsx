"use client";

import { getAllbatch } from "@/api/admin-api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCaretBack } from "react-icons/io5";
import "./style.scss";

type Batches = {
  batch: {
    isActive: boolean;
    id: string;
    name: string;
    in_time: string;
    students: [];
  }[];
};

const Batches = () => {
  const [data, setData] = useState<Batches>();
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getAllbatch(token ?? "");

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  //console.log("data->", data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <section id="adminBatches">
      <Link href="/dashboard" className="dashLink">
        <IoCaretBack />
        Dashboard
      </Link>
      <div className="card card-Batches">
        <h4>Batches: {!data ? "loading..." : data.batch.length}</h4>
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
          data.batch
            .filter((batch) =>
              batch.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
            .map((item, i) => {
              return (
                <Link href={`/dashboard/batches/${item.id}`} key={i}>
                  {i + 1}. {item.name} | T: {item.in_time} | S:{" "}
                  {item.students.length} |{" "}
                  {item.isActive ? "active" : "inActive"}
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default Batches;
