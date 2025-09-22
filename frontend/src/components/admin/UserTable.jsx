// src/components/admin/UsersTable.jsx
import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { useUser } from "../../context/UserContext";
import AddUser from "./AddUser";
import { toast } from "react-toastify";

const TABLE_HEAD = ["Member", "Email", "Phone", "Role", "Account", "Actions"];

const UsersTable = () => {
  const { currentUser, users, setUsers } = useUser();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Open modal for editing
  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  // Open modal for adding
  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

const handleDeleteClick = async (uid) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`http://localhost:5000/api/users/${uid}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      // Try to parse JSON error, fallback to generic
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to delete user");
    }

    const data = await res.json();
    console.log(data.message);

    // Remove user from state
    setUsers(prev => prev.filter(user => user.uid !== uid));

    toast.success("User deleted successfully!");
  } catch (error) {
    console.error("Error deleting user:", error);
    toast.error("Error deleting user: " + error.message);
  }
};



  // Fetch users function
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      let data = await res.json();

      // Non-superadmins cannot see other superadmins
      if (currentUser?.role?.roleName !== "superadmin") {
        data = data.filter((u) => u.role?.roleName !== "superadmin");
      }

      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    if (currentUser) fetchUsers();
  }, [currentUser]);

  // Filter users for search
  const filteredRows = users.filter((user) => {
    const searchLower = search.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower)
    );
  });

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="p-4 sm:p-6 bg-white shadow rounded-lg w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-500">
            Members List
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            See information about all members
          </p>
        </div>

        {/* Add User Button */}
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={handleAddClick}
        >
          <UserPlusIcon className="h-5 w-5" /> Add User
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left border-collapse min-w-[600px] sm:min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className={`p-2 sm:p-3 text-gray-500 text-xs sm:text-sm font-normal border-b ${
                    head === "Phone" ? "hidden lg:table-cell" : ""
                  }`}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((user, idx) => (
              <tr
                key={user._id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-2 sm:p-3 flex items-center gap-2 sm:gap-3">
                  <img
                    src={
                      user.profilePic ||
                      "https://www.w3schools.com/howto/img_avatar.png"
                    }
                    alt={user.firstName}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                  />
                  <span className="text-gray-800 text-xs sm:text-sm hidden xl:block">
                    {user.firstName} {user.lastName}
                  </span>
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                  {user.email}
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700 hidden lg:block">
                  {user.phone}
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                  {user.role?.roleName || "user"}
                </td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm">
                  <span
                    className={`px-2 py-1 text-[10px] sm:text-xs rounded-full font-semibold ${
                      user.isLocked
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.isLocked ? "Locked" : "Active"}
                  </span>
                </td>
                <td className="p-2 sm:p-3 flex gap-2">
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => handleEditClick(user)}
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteClick(user.uid)}>
                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-3xl rounded-lg p-6 relative">
            <AddUser
              closeModal={() => setIsModalOpen(false)}
              onUserAdded={(newUser) => {
                if (editingUser) {
                  // Replace updated user in list
                  setUsers((prev) =>
                    prev.map((u) => (u._id === newUser._id ? newUser : u))
                  );
                } else {
                  // Add new user
                  setUsers((prev) => [newUser, ...prev]);
                }
              }}
              userToEdit={editingUser}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
