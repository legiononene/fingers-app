"use client";

import Link from "next/link";
import "./style.scss";
import { useEffect, useState } from "react";
import { ping } from "@/api/users-api";
import { AiOutlineUsergroupAdd } from "react-icons/ai";

type UserType = {
  data: { id: string; name: string; students: {}[] }[];
  user: { username: string };
};

const UserDashboard = () => {
  const [data, setData] = useState<UserType>();

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
  //("Dashboard Data ->", data);

  return (
    <section id="userDashboard">
      <div className="title">
        <h2>User Dashboard</h2>
        <p>{!data ? "loading..." : data.user.username}</p>
      </div>
      <Link href="/user-dashboard/batches" className="card card-batch">
        <h4>Batches:</h4>
        <p>{!data ? "loading..." : data.data.length}</p>
      </Link>
      <Link href="/user-dashboard/students" className="card card-student">
        <h4>Students:</h4>
        <p>
          {!data
            ? "loading..."
            : data.data.reduce(
                (partialSum, a) => partialSum + a.students.length,
                0
              )}
        </p>
      </Link>
      <div className="card CRUD">
        <Link href="/user-dashboard/add-batches">
          <AiOutlineUsergroupAdd />
          Add Batches
        </Link>
      </div>
    </section>
  );
};

export default UserDashboard;
