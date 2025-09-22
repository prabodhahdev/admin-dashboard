import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddRole = ({ closeModal, roleToEdit, refreshRoles }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState({
    manageUsers: false,
    manageRoles: false,
  });
  const [errors, setErrors] = useState({ roleName: "", description: "" });

  useEffect(() => {
    if (roleToEdit) {
      setRoleName(roleToEdit.roleName);
      setDescription(roleToEdit.description);
      setPermissions(
        roleToEdit.permissions || { manageUsers: false, manageRoles: false }
      );
    }
  }, [roleToEdit]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "roleName":
        if (!/^[a-zA-Z0-9_-]{3,30}$/.test(value))
          error = "Role name must be 3-30 chars (letters, numbers, - or _)";
        break;
      case "description":
        if (value.length < 5) error = "Description must be at least 5 chars";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const resetForm = () => {
    setRoleName("");
    setDescription("");
    setPermissions({ manageUsers: false, manageRoles: false });
    setErrors({ roleName: "", description: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid =
      validateField("roleName", roleName) &&
      validateField("description", description);

    if (!isValid) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    try {
      const method = roleToEdit ? "PUT" : "POST";
      const url = roleToEdit
        ? `http://localhost:5000/api/roles/${roleToEdit._id}`
        : "http://localhost:5000/api/roles";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleName, description, permissions }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save role");
      }

      toast.success(
        roleToEdit ? "Role updated successfully!" : "Role added successfully!"
      );
      if (!roleToEdit) resetForm();
      if (closeModal) closeModal();
      if (refreshRoles) refreshRoles();
    } catch (error) {
      console.error(error);
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg relative z-50">
      {/* Close Button */}
      <button
        type="button"
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>

      <h2 className="text-lg sm:text-xl font-semibold text-gray-500 mb-5">
        {roleToEdit ? "Edit Role" : "Add New Role"}
      </h2>

      <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
        {/* Role Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Role Name
          </label>
          <input
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            onBlur={(e) => validateField("roleName", e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none ${
              errors.roleName ? "border-red-500" : ""
            }`}
          />
          {errors.roleName && (
            <span className="text-red-500 text-sm">{errors.roleName}</span>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={(e) => validateField("description", e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none ${
              errors.description ? "border-red-500" : ""
            }`}
          />
          {errors.description && (
            <span className="text-red-500 text-sm">{errors.description}</span>
          )}
        </div>

        {/* Permissions */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Permissions
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={permissions.manageUsers}
              onChange={(e) =>
                setPermissions({
                  ...permissions,
                  manageUsers: e.target.checked,
                })
              }
            />
            Manage Users
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={permissions.manageRoles}
              onChange={(e) =>
                setPermissions({
                  ...permissions,
                  manageRoles: e.target.checked,
                })
              }
            />
            Manage Roles
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="submit"
            className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
          >
            {roleToEdit ? "Update Role" : "Add Role"}
          </button>
          {!roleToEdit && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRole;
