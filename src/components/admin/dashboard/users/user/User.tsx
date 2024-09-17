"use client";

import { useEffect, useState } from "react";
import { UserType } from "@/types/types";
import { deleteUser, getUsersById } from "@/api/admin-api";
import { MdDelete } from "react-icons/md";

import "./style.scss";
import Link from "next/link";
import { IoCaretBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

const User = ({ slug }: { slug: string }) => {
  const [data, setData] = useState<UserType>();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // State for the dialog
  const [branchToDelete, setBranchToDelete] = useState<string | null>(null); // Track branch to delete
  const [deleteError, setDeleteError] = useState(""); // State to handle errors

  const router = useRouter();

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    try {
      const dashboardData = await getUsersById(slug, token ?? "");

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  console.log("users->", data);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteClick = (branchId: string) => {
    setBranchToDelete(branchId); // Store the branch ID to be deleted
    setShowDeleteDialog(true); // Show the delete confirmation dialog
  };
  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (branchToDelete !== null && token) {
      try {
        await deleteUser(branchToDelete.toString(), token); // Call deleteUser API
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

  return (
    <section id="adminUser">
      <div className="links">
        <Link href="/dashboard" className="dashLink">
          <IoCaretBack />
          Dashboard
        </Link>
        <Link href="/dashboard/users" className="dashLink">
          <IoCaretBack />
          Users
        </Link>
      </div>
      <div className="card card-user">
        <h4>
          {!data
            ? "loading..."
            : `${data.user.username}: ${data.user.batch.length}`}

          <button onClick={() => data && handleDeleteClick(data.user.id)}>
            <MdDelete size={20} />
          </button>
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
          data.user.batch
            .filter((batch) =>
              batch.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically

            .map((b, i) => {
              const studentCount = b.students ? b.students.length : 0;

              return (
                <Link href={`/dashboard/users/${slug}/${b.id}`} key={i}>
                  {i + 1}. {b.name} | S: {studentCount} |{" "}
                  {b.isActive ? "Active" : "Inactive"}
                </Link>
              );
            })
        )}
      </div>
    </section>
  );
};

export default User;
