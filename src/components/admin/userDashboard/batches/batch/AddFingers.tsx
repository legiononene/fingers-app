"use client";

import { z } from "zod";
import "./addFingers.scss";
import { useEffect, useState } from "react";
import { addFingers, deleteFinger, getFinger } from "@/api/users-api";
import { MdDelete } from "react-icons/md";
const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const fingersSchema = z.array(
  z.object({
    image: z.string(), // base64 string
    scale: z.number(),
    primary: z.string().optional(),
  })
);

type StudentsType = [
  {
    id: number;
    name: string;
    aadhar_number: string;
    status: string;
    fingers: { primary: boolean }[];
    batch: { name: string };
  }
];

type FingerType = { primary: boolean; id: number };
type FingersDataTypes = {
  studentName: string;
  studentId: string;
  openFingerUpload: boolean;
  setOpenFingerUpload: (value: boolean) => void;
  studentFingers: FingerType[];
  fetchDashboardData: () => void;
  setStudentFingers: (value: FingerType[]) => void;
};

const AddFingers = ({
  studentId,
  openFingerUpload,
  setOpenFingerUpload,
  studentName,
  studentFingers,
  fetchDashboardData,
  setStudentFingers,
}: FingersDataTypes) => {
  const [files, setFiles] = useState<File[]>([{} as File]);
  const [baseSixtyFourFiles, setBaseSixtyFourFiles] = useState<
    { image: string; scale: number; primary?: string }[]
  >([]);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [existingFingers, setExistingFingers] = useState<FingerType[]>([]);

  console.log("studentFingers->", studentFingers);
  console.log("studentId->", studentId);
  const fetchFingers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");

      const response = await getFinger(studentId, token ?? "");
      setExistingFingers(response);
    } catch (error) {
      console.error("Error fetching fingers:", error);
    }
  };
  useEffect(() => {
    fetchFingers();
  }, [studentId]);

  console.log("existingFingers->", existingFingers);

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        newFiles[index] = e.target.files[0];
        return newFiles;
      });
    }
  };

  const addMoreFiles = () => {
    if (files.length < 6) {
      setFiles((prevFiles) => [...prevFiles, {} as File]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString());
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      setStatusMessage("Converting...");
      const convertedFiles = await Promise.all(
        files.map(async (file) => {
          if (file instanceof File) {
            const base64 = await fileToBase64(file);
            return { image: base64, scale: 1 };
          }
          return { image: "", scale: 1 };
        })
      );

      setBaseSixtyFourFiles(convertedFiles);
      setStatusMessage("Converted!");

      await addFingers(
        convertedFiles.map((v, i) => ({ ...v, primary: `FD-${i + 1}` })),
        studentId,
        token
      );
      setStatusMessage("Fingers Uploaded Successfully");
      setFiles([]);
      setBaseSixtyFourFiles([]);
    } catch (error) {
      setStatusMessage("Error processing files");
      console.error("Error converting files to Base64", error);
      if (error instanceof z.ZodError) {
        setStatusMessage(error.errors[0]?.message || "Validation failed");
      } else if (error instanceof Error) {
        setStatusMessage("Failed to add Fingers: " + error.message);
      } else {
        console.error("Error adding Fingers", error);
      }
    } finally {
      fetchFingers();
      fetchDashboardData();
    }
  };

  const handleDeleteFinger = async (fingerId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in again.");

      // Perform the delete operation
      const response = await deleteFinger(fingerId.toString(), token ?? "");

      // Check if the response indicates success (this depends on what your API returns)
      if (response.status === 200 || response.ok) {
        // Update the state to reflect the deleted finger
        setExistingFingers((prevFingers) =>
          prevFingers.filter((finger) => finger.id !== fingerId)
        );
        setStatusMessage("Finger deleted successfully");
      } else {
        // If the API responds with something other than success
        throw new Error("Failed to delete finger");
      }
    } catch (error: any) {
      setStatusMessage(
        (error.message as string).endsWith("JSON")
          ? "Finger deleted successfully"
          : error.message
      );
      console.error("Error deleting finger:", error);
    } finally {
      fetchFingers();
      fetchDashboardData();
      setStudentFingers(studentFingers);
    }
  };

  return (
    <section id="AddFingers" onClick={() => setOpenFingerUpload(false)}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div className="title">
          <h4>
            Fingers of: {studentName} | {studentId}
          </h4>
          <button onClick={() => setOpenFingerUpload(false)}>Close</button>
        </div>
        {existingFingers.length != 0 && (
          <div className="exist-fingers">
            <h5>Existing Fingers:</h5>
            <div className="fingers">
              {studentFingers.map((finger, i) => (
                <>
                  <div key={i} className="container">
                    <img
                      src={`${
                        BackendUrl?.split("/api")[0] ?? ""
                      }/finger/image/${finger.id}`}
                      alt="alt"
                      crossOrigin="anonymous"
                    />
                    <button onClick={() => handleDeleteFinger(finger.id)}>
                      <MdDelete />
                    </button>
                  </div>
                </>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h5>Add Fingers:</h5>

          {files.map((file, index) => (
            <div key={index} className="file-input-group">
              <p>{index + 1}</p>
              <input
                type="file"
                name={`myImage_${index}`}
                accept="image/*"
                onChange={(e) => handleFileChange(index, e)}
                required
              />
            </div>
          ))}

          <div className="buttons">
            <button
              type="button"
              onClick={addMoreFiles}
              disabled={files.length >= 6}
            >
              Add More
            </button>

            {files.length > 1 && (
              <button
                type="button"
                onClick={() => setFiles((s) => s.slice(0, -1))}
                disabled={files.length === 1}
                className="remove"
              >
                Remove
              </button>
            )}
          </div>
          <button type="submit">Add Fingers</button>
        </form>
        {statusMessage && <p>{statusMessage}</p>}
      </div>
    </section>
  );
};

export default AddFingers;
