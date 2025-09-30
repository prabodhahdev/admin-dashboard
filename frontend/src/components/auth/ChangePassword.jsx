// src/components/admin/ChangePassword.jsx
import React, { useState } from "react";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { toast } from "react-toastify";

const ChangePassword = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({ current: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const validateNewPassword = (value) => {
    if (!passwordRegex.test(value)) {
      setErrors((prev) => ({
        ...prev,
        new: "Password must include uppercase, lowercase, number, special character, and minimum 8 characters.",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, new: "" }));
    return true;
  };

  const validateConfirmPassword = (value) => {
    if (value !== newPassword) {
      setErrors((prev) => ({ ...prev, confirm: "Passwords do not match." }));
      return false;
    }
    setErrors((prev) => ({ ...prev, confirm: "" }));
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return toast.error("User not logged in.");

    const isNewValid = validateNewPassword(newPassword);
    const isConfirmValid = validateConfirmPassword(confirmPassword);
    if (!isNewValid || !isConfirmValid) return;

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/wrong-password")
        toast.error("Current password is incorrect.");
      else toast.error("Failed to change password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md relative">
        {/* X button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-xl text-center font-semibold mb-6 text-gray-500">
          Change Password
        </h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validateNewPassword(e.target.value);
            }}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none"
            required
          />
          {errors.new && <p className="text-red-500 text-sm">{errors.new}</p>}
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              validateConfirmPassword(e.target.value);
            }}
            className="w-full h-12 px-4 border border-gray-300 rounded-lg outline-none"
            required
          />
          {errors.confirm && (
            <p className="text-red-500 text-sm">{errors.confirm}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 w-full px-4 py-2 rounded bg-indigo-500 text-white hover:opacity-90"
          >
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
