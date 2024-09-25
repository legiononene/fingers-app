"use client";

import { BsFiletypeRaw } from "react-icons/bs";
import { BsArrowRepeat } from "react-icons/bs";
import { IoFingerPrintSharp } from "react-icons/io5";
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
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("studentFingers->", studentFingers);
  console.log("studentId->", studentId);
  console.log("baseSixtyFourFiles->", studentFingers);
  console.log("processedImages->", studentId);

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

  const handleFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFiles((prevFiles) => {
        const newFiles = [...prevFiles];
        newFiles[index] = selectedFile;
        return newFiles;
      });

      try {
        const base64 = await fileToBase64(selectedFile);
        setBaseSixtyFourFiles((prevBase64Files) => {
          const newBase64Files = [...prevBase64Files];
          newBase64Files[index] = { image: base64, scale: 1 };
          return newBase64Files;
        });
        setStatusMessage("File converted to base64");
      } catch (error) {
        console.error("Error converting file to Base64", error);
      }
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

  const handleRawFileChange = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setError("Please upload a valid image file.");
      return;
    }

    const file = files[0];
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "https://python-fastapi-ie9w.onrender.com/process-fingerprint",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error("Server response:", result);
        throw new Error(`Failed to process the image: ${result.error}`);
      }

      setProcessedImages((prev) => {
        const newImages = [...prev];
        newImages[index] = `data:image/jpeg;base64,${result.processedImage}`;
        return newImages;
      });
      setBaseSixtyFourFiles((prev) => [
        ...prev,
        {
          image: processedImages[index],
          scale: 1,
        },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred.";
      setError(`An error occurred while processing the image: ${errorMessage}`);
      console.error("Detailed error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      console.log("processedImages->", processedImages);
      const finalFingers = baseSixtyFourFiles.map((base64File, i) => {
        console.log("base64File->", base64File);
        return {
          image: processedImages[i] || base64File.image,
          scale: base64File.scale,
          primary: `FD-${i + 1}`,
        };
      });

      await addFingers(finalFingers, studentId, token);

      setStatusMessage("Fingers Uploaded Successfully");
      setBaseSixtyFourFiles([]);
      setProcessedImages([]);
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

      if (response.message === "OK") {
        // Update both local states to reflect the deleted finger
        const updatedFingers = existingFingers.filter(
          (finger) => finger.id !== fingerId
        );
        setExistingFingers(updatedFingers);
        setStudentFingers(updatedFingers); // Also update studentFingers state to trigger re-render

        setStatusMessage("Finger deleted successfully");
      } else {
        throw new Error("Failed to delete finger");
      }
    } catch (error: any) {
      setStatusMessage("Error deleting finger: " + error.message);
      console.error("Error deleting finger:", error);
    } finally {
      fetchFingers();
      fetchDashboardData(); // Re-fetch the dashboard data
    }
  };
  const handleRemove = () => {
    // Only remove the last entry from both files and processedImages if there are more than one
    if (files.length > 1) {
      setFiles((prev) => prev.slice(0, -1)); // Remove last file
      setProcessedImages((prev) => {
        const newImages = [...prev];
        newImages.pop(); // Remove last processed image corresponding to the last file
        return newImages;
      });
      setBaseSixtyFourFiles((prev) => prev.slice(0, -1)); // Remove the last base64 entry
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
        {studentFingers.length > 0 && (
          <div className="exist-fingers">
            <h5>Existing Fingers:</h5>
            <div className="fingers">
              {studentFingers.map((finger, i) => (
                <div key={finger.id} className="container">
                  <img
                    src={`${BackendUrl?.split("/api")[0] ?? ""}/finger/image/${
                      finger.id
                    }`}
                    alt="Fingerprint"
                    crossOrigin="anonymous"
                  />
                  <button onClick={() => handleDeleteFinger(finger.id)}>
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h5>Add Fingers:</h5>

          {files.map((file, index) => (
            <div key={index} className="file-input-group">
              <p>{index + 1}</p>
              {/* ----------------enhanced -----------------*/}
              <div className="enhanced">
                <button
                  type="button"
                  className={file.name && "selected"}
                  onClick={() => {
                    const inputElement = document.getElementById(
                      `fileInput_${index}`
                    ) as HTMLInputElement | null;
                    inputElement?.click();
                  }}
                >
                  {file.name ? file.name : <IoFingerPrintSharp size={40} />}
                </button>
                <input
                  type="file"
                  id={`fileInput_${index}`}
                  accept="image/*"
                  onChange={(e) => handleFileChange(index, e)}
                  style={{ display: "none" }} // Hide the input
                />
              </div>
              {/* ----------------unEnhanced -----------------*/}
              <div className="unEnhanced">
                <button
                  type="button"
                  className={processedImages[index] && "selected"}
                  onClick={() => {
                    const inputElement = document.getElementById(
                      `rawFileInput_${index}`
                    ) as HTMLInputElement | null;
                    inputElement?.click();
                  }}
                >
                  {processedImages[index] ? (
                    <img
                      src={processedImages[index]}
                      alt="Processed Fingerprint"
                      crossOrigin="anonymous"
                    />
                  ) : isProcessing ? (
                    <BsArrowRepeat size={40} className="processiong" />
                  ) : (
                    <BsFiletypeRaw size={40} />
                  )}
                </button>
                <input
                  type="file"
                  id={`rawFileInput_${index}`}
                  accept="image/*"
                  onChange={(e) => handleRawFileChange(index, e)}
                  style={{ display: "none" }} // Hide the input
                />
              </div>
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
                onClick={handleRemove}
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
        {isProcessing && <p>Processing image. Please wait..</p>}
        {error && <p>{error}</p>}
      </div>
    </section>
  );
};

export default AddFingers;
