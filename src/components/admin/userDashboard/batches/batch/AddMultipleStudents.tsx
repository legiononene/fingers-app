"use client";

import { useState } from "react";
import { addStudent } from "@/api/users-api";
import "./style.scss";

const AddMultipleStudents = ({
  branchID,
  setSuccess,
  setOpenMultipleStudentsForm,
  fetchDashboardData,
  success,
}: {
  branchID: string;
  setSuccess: (value: string) => void;
  setOpenMultipleStudentsForm: (value: boolean) => void;
  fetchDashboardData: () => void;
  success: string;
}) => {
  const [name, setName] = useState("");
  const [aadhar, seAadhar] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const names = name.split("\n");
    const aadhars = aadhar.split("\n");

    if (names.length !== aadhars.length) {
      setError("Name and Aadhar number lists must have equal length.");
      return;
    }

    const formDataFinal = {
      batchId: branchID,
      student: names.map((name, i) => ({ name, aadhar_number: aadhars[i] })),
    };

    try {
      // Assuming a similar schema validation exists in the parent component
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      await addStudent(formDataFinal, token);
      setSuccess("Students added successfully!");
      setName("");
      seAadhar("");
      fetchDashboardData();
      setOpenMultipleStudentsForm(false);
    } catch (error) {
      console.error("Error details:", error);
      if (error instanceof Error) {
        setError("Failed to add Students: " + error.message);
      } else {
        console.error("Error adding Students", error);
      }
    }
  };

  return (
    <section
      id="addMultipleStudents"
      onClick={() => {
        setOpenMultipleStudentsForm(false);
      }}
    >
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div className="title">
          <h4>Add Students</h4>
          <button
            onClick={() => {
              setOpenMultipleStudentsForm(false);
            }}
          >
            close
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="student">
            <textarea
              placeholder="Student Name Line by line"
              value={name}
              required
              rows={10}
              onChange={(e) => {
                const value = e.target.value;
                setName(value);
              }}
            />
            <textarea
              placeholder="Aadhar No. (last 8 digits) Line by line"
              value={aadhar}
              required
              rows={10}
              onChange={(e) => {
                const value = e.target.value;

                // Split the input into lines
                const lines = value.split("\n");

                // Check each line to ensure it contains no more than 8 digits
                const validLines = lines.map((line) => {
                  // Allow only digits and limit to 8 characters
                  return line.replace(/[^\d]/g, "").slice(0, 8);
                });

                // Join the lines back together
                const newValue = validLines.join("\n");

                // Update the state
                seAadhar(newValue);
              }}
            />
          </div>

          <button type="submit">Submit All Students</button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>
    </section>
  );
};

export default AddMultipleStudents;
