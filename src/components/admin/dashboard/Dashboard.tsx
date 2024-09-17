"use client";

import { useEffect, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { DashboardType } from "../../../types/types";
import "./style.scss";
import { getDashboard } from "@/api/admin-api";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";

const Dashboard = () => {
  const [data, setData] = useState<DashboardType>();
  const [Error, setError] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getDashboard(token ?? "");
      setError(false);
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(true);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (Error) return <section id="adminDash">Not Admin</section>;
  else
    return (
      <section id="adminDash">
        <div className="title">
          <h2>Admin</h2>
        </div>
        <Link href="/dashboard/users" className="card card-user">
          <h4>Users:</h4>
          <p>{!data ? "loading..." : data.userCount}</p>
        </Link>
        <Link href="/dashboard/batches" className="card card-batch">
          <h4>Batches:</h4>
          <p>{!data ? "loading..." : data.batchCount}</p>
        </Link>
        <Link href="/dashboard/students" className="card card-student">
          <h4>Students:</h4>
          <p>{!data ? "loading..." : data.studentCount}</p>
        </Link>
        <div className="card CRUD">
          <Link href="/dashboard/add-users">
            <AiOutlineUserAdd />
            Add Users
          </Link>
          <Link href="/dashboard/add-batches">
            <AiOutlineUsergroupAdd />
            Add Batches
          </Link>
        </div>
      </section>
    );
};

export default Dashboard;
