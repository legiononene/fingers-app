"use client";

import { BiCloudUpload } from "react-icons/bi";
import { TbHandThreeFingers } from "react-icons/tb";
import { BsFiletypeRaw } from "react-icons/bs";
import { BsArrowRepeat } from "react-icons/bs";
import { IoFingerPrintSharp } from "react-icons/io5";
import { z } from "zod";
import "./addFingers.scss";
import React, { useEffect, useState } from "react";
import { addFingers, deleteFinger, getFinger } from "@/api/users-api";
import { MdDelete } from "react-icons/md";

const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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

const fingersSchema = z.array(
  z.object({
    image: z.string(), // base64 string
    scale: z.number(),
    primary: z.string().optional(),
    name: z.string(),
    mode: z.enum(["FILE", "BS64", "emt"]),
  })
);

const AddFingers = ({
  studentId,
  openFingerUpload,
  setOpenFingerUpload,
  studentName,
  studentFingers,
  fetchDashboardData,
  setStudentFingers,
}: FingersDataTypes) => {
  const [files, setFiles] = useState<z.infer<typeof fingersSchema>>([
    {
      image: "",
      mode: "emt",
      name: "",
      scale: 1,
    },
  ]);

  const [statusMessage, setStatusMessage] = useState<string>("");
  const [existingFingers, setExistingFingers] = useState<FingerType[]>([]);
  const [processedImages, setProcessedImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);

  //console.log("studentFingers->", studentFingers);
  //console.log("studentId->", studentId);
  //console.log("baseSixtyFourFiles->", studentFingers);
  //console.log("processedImages->", studentId);

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

  //console.log("existingFingers->", existingFingers);

  const handleFileChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const selectedFile = e.target.files[0];
      const base64 = await fileToBase64(selectedFile);

      setFiles((prev) => {
        const newFiles = [...prev];
        newFiles[index] = {
          image: base64,
          mode: "FILE",
          name: selectedFile.name,
          scale: 1,
        };
        return newFiles;
      });
      setStatusMessage("File converted to base64");
    } catch (error) {
      console.error("Error converting file to Base64", error);
    }
  };

  const addMoreFiles = () => {
    if (files.length < 6) {
      setFiles((prevFiles) => [
        ...prevFiles,
        {
          image: "",
          scale: 1,
          mode: "emt",
          name: "",
        },
      ]);
      setIsProcessing((prev) => [...prev, false]);
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
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files == null || e.target.files.length === 0) return;

    const files = e.target.files;

    setIsProcessing((prev) => {
      const newProcessing = [...prev];
      newProcessing[index] = true; // Set processing to true for this index
      return newProcessing;
    });

    if (!files || files.length === 0) {
      setError("Please upload a valid image file.");
      return;
    }

    const file = files[0];
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

      setFiles((prv) => {
        const newFiles = prv;
        newFiles[index] = {
          image: `data:image/jpeg;base64,${result.processedImage}`,
          mode: "BS64",
          name:
            e.target.files && e.target.files.length != 0
              ? e.target.files[0].name
              : "",
          scale: 1,
        };
        return newFiles;
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred.";
      setError(`An error occurred while processing the image: ${errorMessage}`);
      console.error("Detailed error:", err);
    } finally {
      setIsProcessing((prev) => {
        const newProcessing = [...prev];
        newProcessing[index] = false; // Set processing to false for this index
        return newProcessing;
      });
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      //console.log("processedImages->", processedImages);
      const finalFingers = files.map((base64File, i) => {
        //console.log("base64File->", base64File);
        return {
          image: base64File.image,
          scale: base64File.scale,
          primary: `FD-${i + 1}`,
        };
      });

      await addFingers(finalFingers, studentId, token);

      setStatusMessage("Fingers Uploaded Successfully");
      setFiles([
        {
          image: "",
          mode: "emt",
          name: "",
          scale: 1,
        },
      ]);
      setProcessedImages([]);
      setOpenFingerUpload(false);
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
    if (files.length > 1) {
      setFiles((prev) => prev.slice(0, -1));
    }
  };

  return (
    <section id="AddFingers" onClick={() => setOpenFingerUpload(false)}>
      <div className="box" onClick={(e) => e.stopPropagation()}>
        <div className="title">
          <h4>
            Fingers of: {studentName} | {studentId}
          </h4>
          <div className="two">
            <button
              title="Add Multiple Fingerprints (Enhanced)"
              onClick={() => {
                const inputElement = document.getElementById(
                  "multipleImages"
                ) as HTMLInputElement | null;
                inputElement?.click();
              }}
              className={files.some((file) => file.image) ? "selected" : ""}
            >
              <TbHandThreeFingers size={20} />
            </button>
            <input
              id="multipleImages"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files == null) return;
                if (e.target.files.length == 0) return;
                if (e.target.files[0] == null) return;

                try {
                  Array.from(e.target.files).map(async (fl, index) => {
                    const base64 = await fileToBase64(fl);
                    //console.log(base64);
                    setStatusMessage("File converted to base64");
                    setFiles((prv) => {
                      const newFiles = prv;
                      newFiles[index] = {
                        image: base64,
                        mode: "FILE",
                        name:
                          e.target.files && e.target.files.length != 0
                            ? e.target.files[0].name
                            : "",
                        scale: 1,
                      };
                      return newFiles;
                    });
                  });
                } catch (error) {
                  console.error("Error converting file to Base64", error);
                }
              }}
              style={{ display: "none" }}
            />

            <button onClick={() => setOpenFingerUpload(false)}>Close</button>
          </div>
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
                  title="Add a Fingerprint (Enhanced)"
                  type="button"
                  className={file.name && file.mode == "FILE" ? "selected" : ""}
                  onClick={() => {
                    const inputElement = document.getElementById(
                      `fileInput_${index}`
                    ) as HTMLInputElement | null;
                    inputElement?.click();
                  }}
                >
                  {file.name && file.mode == "FILE" ? (
                    file.name
                  ) : (
                    <IoFingerPrintSharp size={40} />
                  )}
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
                  title="Add a Fingerprint (Raw)"
                  type="button"
                  className={file.mode == "BS64" ? "selected" : ""}
                  onClick={() => {
                    const inputElement = document.getElementById(
                      `rawFileInput_${index}`
                    ) as HTMLInputElement | null;
                    inputElement?.click();
                  }}
                >
                  {file.mode == "BS64" ? (
                    <img
                      src={file.image}
                      alt="Processed Fingerprint"
                      crossOrigin="anonymous"
                    />
                  ) : isProcessing[index] ? (
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
        {isProcessing.some((processing) => processing) && (
          <p>Processing image. Please wait..</p>
        )}
        {error && <p>{error}</p>}
      </div>
    </section>
  );
};

export default AddFingers;
