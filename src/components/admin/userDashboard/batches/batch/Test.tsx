import { addFingers, deleteFinger, getFinger } from "@/api/users-api";
import { ChangeEvent, useEffect, useState } from "react";
import { z } from "zod";
import { MdDelete } from "react-icons/md";
import { BsFiletypeRaw } from "react-icons/bs";
import { IoFingerPrintSharp } from "react-icons/io5";

const BackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

type FingerType = { primary: boolean; id: number };

type PropsDataType = {
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
}: PropsDataType) => {
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchFingers();
  }, [studentId]);
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
  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files == null) return;
    if (e.target.files.length == 0) return;
    if (e.target.files[0] == null) return;
    try {
      const selectedFile = e.target.files[0];
      const base64 = await fileToBase64(selectedFile);

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
    } catch (error) {
      console.error("Error converting file to Base64", error);
    }
  };

  const handleRawFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.target.files == null) return;
    if (e.target.files.length == 0) return;
    if (e.target.files[0] == null) return;
    const files = e.target.files;
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
        throw new Error(Failed to process the image: ${result.error});
      }

      setFiles((prv) => {
        const newFiles = prv;
        newFiles[index] = {
          image: data:image/jpeg;base64,${result.processedImage},
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
      setError(An error occurred while processing the image: ${errorMessage});
      console.error("Detailed error:", err);
    } finally {
      setIsProcessing(false);
    }
  };
  const handleRemove = () => {
    if (files.length > 1) {
      setFiles((prev) => prev.slice(0, -1));
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
      const finalFingers = files.map((base64File, i) => {
        console.log("base64File->", base64File);
        return {
          image: base64File.image,
          scale: base64File.scale,
          primary: FD-${i + 1},
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
              <p>{++index}</p>
              <div className="enhanced">
                <button
                  type="button"
                  className={file.name && "selected"}
                  onClick={() => {
                    const inputElement = document.getElementById(
                      fileInput_${index}
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
                  id={fileInput_${index}}
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, index)}
                  style={{ display: "none" }} // Hide the input
                />
              </div>
              <div className="unEnhanced">
                <button
                  type="button"
                  className={file.mode == "BS64" ? "selected" : ""}
                  onClick={() => {
                    const inputElement = document.getElementById(
                      rawFileInput_${index}
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
                  ) : (
                    <BsFiletypeRaw size={40} />
                  )}
                </button>
                <input
                  type="file"
                  id={rawFileInput_${index}}
                  accept="image/*"
                  onChange={(e) => handleRawFileChange(e, index)}
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
        {isProcessing && <p>Processing image...</p>}
        {error && <p>{error}</p>}
      </div>
    </section>
  );
};

export default AddFingers;