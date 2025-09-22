// pages/user/UserDashboardPage.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import { useUser } from "../../context/UserContext";
import Sidebar from "../../layouts/Sidebar";

const UserDashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { currentUser, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!currentUser) return <div>User not found</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "ml-64" : "ml-0"} 
        md:ml-20 
        lg:ml-0`}
      >
        {/* Top Navbar */}
        <AdminHeader
          currentUser={currentUser}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Page content */}
        <main className="flex-1 p-4 overflow-y-auto mt-14">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserDashboardPage;
