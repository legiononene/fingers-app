import { z } from "zod";
import "./style.scss";
import React, { useEffect, useState } from "react";
import { addStudent } from "@/api/users-api";

const students = z.object({
  batchId: z.string(),
  student: z.array(
    z.object({
      name: z.string(),
      aadhar_number: z.string(),
    })
  ),
});

const AddStudents = ({
  branchID,
  open,
  close,
  setSuccess,
  success,
  fetchDashboardData,
}: {
  branchID: string;
  open: boolean;
  close: (value: boolean) => void;
  setSuccess: (value: string) => void;
  success: string;
  fetchDashboardData: () => void;
}) => {
  const [addMore, setAddMore] = useState([{ name: "", aadhar_number: "" }]);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formDataFinal = {
      batchId: branchID,
      student: addMore,
    };

    try {
      students.parse(formDataFinal);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }
      await addStudent(formDataFinal, token);
      setSuccess("Students added successfully!");
      setAddMore([{ name: "", aadhar_number: "" }]);
      fetchDashboardData();
    } catch (error) {
      console.error("Error details:", error);
      if (error instanceof z.ZodError) {
        setError(error.errors[0]?.message || "Validation failed");
      } else if (error instanceof Error) {
        setError("Failed to add Students: " + error.message);
      } else {
        console.error("Error adding Students", error);
      }
    }
  };

  //console.log("addMore->", addMore);

  return (
    <>
      {open && (
        <section
          id="addStudentsModel"
          onClick={() => {
            close(false);
          }}
        >
          <div className="box" onClick={(e) => e.stopPropagation()}>
            <div className="title">
              <h4>Add Students</h4>
              <button
                onClick={() => {
                  close(false);
                }}
              >
                close
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {addMore.map((stu, i) => (
                <div key={i} className="student">
                  <p>{i + 1}.</p>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={stu.name} // Access 'stu' directly from map function
                    onChange={(e) => {
                      setAddMore((data) =>
                        data.map((item, index) =>
                          index === i ? { ...item, name: e.target.value } : item
                        )
                      );
                    }}
                    required
                  />
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="Aadhar No. (last 8 digits)"
                    value={stu.aadhar_number} // Access 'stu' directly
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numeric values
                      if (/^\d*$/.test(value)) {
                        setAddMore((data) =>
                          data.map((item, index) =>
                            index === i
                              ? {
                                  ...item,
                                  aadhar_number: value,
                                }
                              : item
                          )
                        );
                      }
                    }}
                    required
                  />
                </div>
              ))}
              <div className="buttons">
                <button
                  type="button"
                  onClick={() =>
                    setAddMore((s) => [...s, { name: "", aadhar_number: "" }])
                  }
                  disabled={addMore.length == 10}
                >
                  Add more
                </button>
                {addMore.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAddMore((s) => s.slice(0, s.length - 1))}
                    className="remove"
                  >
                    remove
                  </button>
                )}
              </div>
              <button type="submit">Add Students</button>
            </form>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </div>
        </section>
      )}
    </>
  );
};

export default AddStudents;
