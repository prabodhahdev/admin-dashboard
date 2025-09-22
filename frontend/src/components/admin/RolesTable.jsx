// src/components/admin/RolesTable.jsx
import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import AddRole from "./AddRole"; 
import { toast } from "react-toastify";

const TABLE_HEAD = ["Role Name", "Description", "Permissions", "Actions"];

const RolesTable = () => {
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [modalRole, setModalRole] = useState(false); 

  const API_URL = "http://localhost:5000/api/roles";

  // Delete role
  const handleDeleteClick = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await fetch(`${API_URL}/${roleId}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to delete role");
      }

      setRoles(prev => prev.filter(r => r._id !== roleId));
      toast.success("Role deleted successfully!");
    } catch (err) {
      console.error("Error deleting role:", err);
      toast.error("Error deleting role: " + err.message);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error("Error fetching roles:", err);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const filteredRows = roles.filter((role) => {
    const searchLower = search.toLowerCase();
    return (
      role.roleName.toLowerCase().includes(searchLower) ||
      role.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4 sm:p-6 bg-white shadow rounded-lg w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-6 items-center gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-500">Roles List</h2>
          <p className="text-gray-500 text-sm sm:text-base">See information about all roles</p>
        </div>

        {/* Add Role Button */}
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
          onClick={() => setModalRole(null)} 
        >
          <UserPlusIcon className="h-5 w-5" /> Add Role
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search roles"
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
                  className="p-2 sm:p-3 text-gray-500 text-xs sm:text-sm font-normal border-b"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((role, idx) => (
              <tr key={role._id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">{role.roleName}</td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">{role.description}</td>
                <td className="p-2 sm:p-3 text-xs sm:text-sm text-gray-700">
                  {role.permissions
                    ? Object.keys(role.permissions)
                        .filter((key) => role.permissions[key])
                        .join(", ")
                    : "-"}
                </td>
                <td className="p-2 sm:p-3 flex gap-2">
                  {/* Edit Role */}
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setModalRole(role)} // edit mode
                  >
                    <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  {/* Delete Role */}
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteClick(role._id)}
                  >
                    <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Role Modal */}
      {modalRole !== false && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <AddRole
            roleToEdit={modalRole}
            closeModal={() => {
              setModalRole(false);
              fetchRoles(); 
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RolesTable;
