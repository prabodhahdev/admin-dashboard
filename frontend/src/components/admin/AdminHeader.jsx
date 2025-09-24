import React, { useState, useContext } from "react";
import AdminSideNavbar from "./AdminSideNavbar";
import { useUser } from "../../context/UserContext";

const AdminHeader = ({ role }) => {
  const { currentUser } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="sm:hidden p-2 mr-2 rounded "
            onClick={toggleSidebar}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            alt="Logo"
            className="h-8 mr-2"
          />
          <span className="font-bold text-xl mr-4">LOGO</span>

          {/* Welcome User */}
          {currentUser && (
            <span className="text-gray-700 text-sm sm:text-base">
              Welcome, {currentUser.firstName} {currentUser.lastName} |{" "}
              {currentUser.role?.roleName || "user"}
            </span>
          )}
        </div>

        {/* Right side: Notification & Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification */}
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center p-1 rounded-full hover:bg-gray-100"
            >
              <img
                src="https://flowbite.com/docs/images/people/profile-picture-5.jpg"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2">
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Edit Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {sidebarOpen && (
            <AdminSideNavbar
              isOpen={sidebarOpen}
              onClose={toggleSidebar}
              role={role}
            />
          )}
        </div>
      )}
    </>
  );
};

export default AdminHeader;
