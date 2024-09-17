"use client";

import Link from "next/link";
import "@/components/admin/dashboard/addUsers/style.scss";
import { IoCaretBack } from "react-icons/io5";
import { useState } from "react";

import { z } from "zod";
import { addbatch } from "@/api/admin-api";

const batchSchema = z.object({
  name: z.string().min(1),
  in_time: z
    .string()
    .regex(/\b(1[0-2]|0?[1-9]):([0-5][0-9]) ?([APap][Mm])\b/gm),
  out_time: z
    .string()
    .regex(/\b(1[0-2]|0?[1-9]):([0-5][0-9]) ?([APap][Mm])\b/gm),
  isActive: z.boolean().optional(),
});

const AddBatches = () => {
  const [batchName, setBatchName] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isActive, setIsActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = {
      name: batchName,
      in_time: inTime,
      out_time: outTime,
      isActive,
    };

    try {
      batchSchema.parse(formData); // Validate data using zod
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      await addbatch(formData, token);
      setSuccess("Batch added successfully!");
      setBatchName("");
      setInTime("");
      setOutTime("");
      setIsActive(false);
    } catch (error) {
      console.error("Error details:", error);
      if (error instanceof z.ZodError) {
        setError(error.errors[0]?.message || "Validation failed");
      } else if (error instanceof Error) {
        setError("Failed to add Batch: " + error.message);
      } else {
        console.error("Error adding batch", error);
      }
    }
  };
  return (
    <section id="addBatches">
      <Link href="/dashboard" className="dashLink">
        <IoCaretBack />
        Dashboard
      </Link>
      <div className="title">
        <h2>Add Batches</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Batch Name"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="In Time (Ex: 08:00 AM)"
          value={inTime}
          onChange={(e) => setInTime(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Out Time (Ex: 02:00 PM)"
          value={outTime}
          onChange={(e) => setOutTime(e.target.value)}
          required
        />
        <select
          value={isActive ? "true" : "false"}
          onChange={(e) => setIsActive(e.target.value === "true")}
        >
          <option value="false">Inactive</option> {/* Default value */}
          <option value="true">Active</option>
        </select>
        <button type="submit">Add</button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
    </section>
  );
};

export default AddBatches;
