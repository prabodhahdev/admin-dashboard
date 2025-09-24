import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const AdminSideNavbar = () => {
  const { currentUser, logout, hasPermission } = useUser();

  if (!currentUser) return null;

  return (
    <aside className="w-64 bg-gray-800 mt-14 text-white flex flex-col p-4 h-screen">
      {hasPermission("manageUsers") && (
        <Link
          to="/superadmin-dashboard/manage-users"
          className="block px-2 py-2 mb-2 hover:bg-gray-700 rounded"
        >
          Manage Users
        </Link>
      )}

      {hasPermission("manageRoles") && (
        <Link
          to="/superadmin-dashboard/manage-roles"
          className="block px-2 py-2 mb-2 hover:bg-gray-700 rounded"
        >
          Manage Roles
        </Link>
      )}

      {currentUser && (
        <Link
          to="/superadmin-dashboard/profile"
          className="block px-2 py-2 mb-2 hover:bg-gray-700 rounded"
        >
          Profile
        </Link>
      )}

      <button
        onClick={logout}
        className="text-left px-2 py-2 hover:bg-gray-700 rounded"
      >
        Logout
      </button>
    </aside>
  );
};

export default AdminSideNavbar;
