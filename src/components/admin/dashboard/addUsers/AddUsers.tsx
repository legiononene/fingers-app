"use client";

import Link from "next/link";
import "./style.scss";
import { IoCaretBack } from "react-icons/io5";
import { useState } from "react";
import { register } from "@/api/users-api";
import { z } from "zod";

const AddUsers = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = { username, password };
    //console.log("Form data:", formData); // Debug log

    try {
      userSchema.parse(formData);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      await register(formData, token);
      //console.log("API Response:", response); // Debug log
      setSuccess("User added successfully!");
      setUsername("");
      setPassword("");
    } catch (err) {
      console.error("Error details:", err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0]?.message || "Validation failed");
      } else if (err instanceof Error) {
        setError("Failed to add user: " + err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <section id="addUsers">
      <Link href="/dashboard" className="dashLink">
        <IoCaretBack />
        Dashboard
      </Link>
      <div className="title">
        <h2>Add Users</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </section>
  );
};

export default AddUsers;
