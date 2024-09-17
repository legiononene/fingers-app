"use client";

import { FaFingerprint } from "react-icons/fa";
import { IoReloadCircle } from "react-icons/io5";
import { AiOutlineUserAdd } from "react-icons/ai";
import {
  deleteBatch,
  DeleteStudent,
  getAllStudentsBybatch,
} from "@/api/users-api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoCaretBack } from "react-icons/io5";
import "@/components/admin/dashboard/users/user/style.scss";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/navigation";
import AddStudents from "./AddStudents";
import AddFingers from "./AddFingers";

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

const Batch = ({ slug }: { slug: string }) => {
  const [data, setData] = useState<StudentsType>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State for the dialog
  const [showDeleteStudentDialog, setShowDeleteStudentDialog] = useState(false); // State for the dialog
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null); // Track branch to delete
  const [studentToDelete, setStudentToDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState(""); // State to handle errors
  const [openAddStudents, setOpenAddStudents] = useState<boolean>(false);
  const [success, setSuccess] = useState("");
  const [openFingerUpload, setOpenFingerUpload] = useState<boolean>(false);
  const [studentToFinger, setStudentToFinger] = useState<number | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  const router = useRouter();
  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getAllStudentsBybatch(token ?? "", slug);

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  //console.log("students->", data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  //---------------------------------------> Batch Delete

  const handleDeleteClick = (branchId: string) => {
    setBranchToDelete(branchId); // Store the branch ID to be deleted
    setShowDeleteDialog(true); // Show the delete confirmation dialog
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (branchToDelete !== null && token) {
      try {
        await deleteBatch(branchToDelete.toString(), token); // Call deleteUser API
        setShowDeleteDialog(false); // Close the dialog after deletion
        router.back();
      } catch (error) {
        console.error("Error deleting user:", error);
        setDeleteError("Failed to delete user.");
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false); // Close the dialog without deleting
    setBranchToDelete(null); // Reset the branch ID
  };

  //---------------------------------------> Student Delete

  const handleStudentDeleteClick = (studentId: number) => {
    setStudentToDelete(studentId); // Store the student ID to be deleted
    setShowDeleteStudentDialog(true); // Show the delete confirmation dialog
  };

  const confirmStudentDelete = async () => {
    const token = localStorage.getItem("token");
    if (studentToDelete !== null && token) {
      try {
        await DeleteStudent(studentToDelete, token); // Call DeleteStudent API
        setShowDeleteStudentDialog(false); // Close the dialog after deletion
        fetchDashboardData(); // Refresh the data
      } catch (error) {
        console.error("Error deleting student:", error);
        setDeleteError("Failed to delete student.");
      }
    }
  };

  const cancelStudentDelete = () => {
    setShowDeleteStudentDialog(false); // Close the dialog without deleting
    setStudentToDelete(null); // Reset the student ID
  };
  //---------------------------------------> Add Finger
  const handleFingerAddClick = (studentId: number, name: string) => {
    setStudentToFinger(studentId); // Store the student ID to be deleted
    setOpenFingerUpload(true); // Show the delete confirmation dialog
    setStudentName(name);
  };

  if (!data || JSON.stringify(data) == "[]") {
    return (
      <section id="userBatch">
        <div className="links">
          <Link href="/user-dashboard" className="dashLink">
            <IoCaretBack />
            Dashboard
          </Link>
          <Link href="/user-dashboard/batches/" className="dashLink">
            <IoCaretBack />
            Batches
          </Link>
        </div>
        <div className="card card-batch">
          <h4>
            No data
            <div className="buttons">
              <button onClick={() => handleDeleteClick(slug)}>
                <MdDelete size={20} />
              </button>
            </div>
          </h4>
          {/* Delete confirmation dialog */}
          {showDeleteDialog && (
            <div className="delete-dialog">
              <p>Are you sure you want to delete this User?</p>
              <button onClick={confirmDelete}>Confirm</button>
              <button onClick={cancelDelete}>Cancel</button>
            </div>
          )}

          {/* Error message if deletion fails */}
          {deleteError && <p className="error">{deleteError}</p>}
        </div>
      </section>
    );
  } else {
    return (
      <section id="userBatch">
        <div className="links">
          <Link href="/user-dashboard" className="dashLink">
            <IoCaretBack />
            Dashboard
          </Link>
          <Link href="/user-dashboard/batches/" className="dashLink">
            <IoCaretBack />
            Batches
          </Link>
        </div>

        <div className="card card-batch">
          <h4>
            {!data
              ? "loading..."
              : `${data[0].batch.name}: ${data.length ? data.length : 0}`}
            <div className="buttons">
              <button onClick={() => fetchDashboardData()}>
                <IoReloadCircle size={20} />
              </button>
              <button
                onClick={() => {
                  data && setOpenAddStudents(true);
                  setSuccess("");
                }}
              >
                <AiOutlineUserAdd size={20} />
              </button>
              <button onClick={() => data && handleDeleteClick(slug)}>
                <MdDelete size={20} />
              </button>
            </div>
          </h4>
          <>
            {/* Delete confirmation dialog */}
            {showDeleteDialog && (
              <div className="delete-dialog">
                <p>Are you sure you want to delete this User?</p>
                <button onClick={confirmDelete}>Confirm</button>
                <button onClick={cancelDelete}>Cancel</button>
              </div>
            )}

            {/* Error message if deletion fails */}
            {deleteError && <p className="error">{deleteError}</p>}

            {/* --------------------------------------------------------- */}

            {/* Delete confirmation dialog */}
            {showDeleteStudentDialog && (
              <div className="delete-dialog">
                <p>Are you sure you want to delete this Student?</p>
                <button onClick={confirmStudentDelete}>Confirm</button>
                <button onClick={cancelStudentDelete}>Cancel</button>
              </div>
            )}

            {/* Error message if deletion fails */}
            {deleteError && <p className="error">{deleteError}</p>}
          </>
          <AddStudents
            branchID={slug}
            open={openAddStudents}
            close={setOpenAddStudents}
            success={success}
            setSuccess={setSuccess}
          />
          {openFingerUpload && studentToFinger && studentName && (
            <AddFingers
              studentId={studentToFinger.toString()}
              openFingerUpload={openFingerUpload}
              setOpenFingerUpload={setOpenFingerUpload}
              studentName={studentName}
            />
          )}
          <input
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <div className="line" />
          {!data ? (
            <p>loading...</p>
          ) : (
            data &&
            data
              .filter((student) =>
                student.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically
              .map((b, i) => {
                return (
                  <div key={i} className="student-item">
                    <Link href="">
                      {i + 1}. {b.name} | (
                      {b.fingers.map((v) => `${v.primary},`)})
                      <span>S: {b.status} (today)</span>
                    </Link>
                    <button
                      className="finger"
                      onClick={() => handleFingerAddClick(b.id, b.name)}
                    >
                      <FaFingerprint size={20} />
                    </button>
                    {/* Delete button for each student */}
                    <button onClick={() => handleStudentDeleteClick(b.id)}>
                      <MdDelete size={20} />
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </section>
    );
  }
};

export default Batch;
