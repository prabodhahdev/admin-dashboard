// src/components/layout/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Sidebar = () => {
  const { currentUser, logout, hasPermission } = useUser();

  if (!currentUser) return null;

  // Sidebar links with required permission
  const sidebarLinks = [
    {
      label: "Manage Users",
      path: "/dashboard/manage-users",
      permission: "manageUsers",
    },
    {
      label: "Manage Roles",
      path: "/dashboard/manage-roles",
      permission: "manageRoles",
    },

    {
      label: "My Profile",
      path: "/dashboard/profile",
      permission: "viewProfile",
    },
   

  ];

  return (
    <aside className="w-64 bg-gray-800 mt-14 text-white flex flex-col p-4 h-screen">
      {sidebarLinks.map(
        (link) =>
          hasPermission(link.permission) && (
            <Link
              key={link.path}
              to={link.path}
              className="block px-2 py-2 mb-2 hover:bg-gray-700 rounded"
            >
              {link.label}
            </Link>
          )
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

export default Sidebar;
