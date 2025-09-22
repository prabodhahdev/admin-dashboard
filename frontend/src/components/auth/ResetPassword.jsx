import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const oobCode = queryParams.get("oobCode");

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  // Realtime validation (under input fields)
  const validateNewPassword = (value) => {
    if (!passwordRegex.test(value)) {
      setNewPasswordError(
        "Password must include uppercase, lowercase, number, special character, and minimum 8 characters."
      );
      return false;
    } else {
      setNewPasswordError("");
      return true;
    }
  };

  const validateConfirmPassword = (value) => {
    if (value && value !== newPassword) {
      setConfirmPasswordError("Passwords do not match.");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  // Submit handler (only toast for submit-time errors)
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const isNewValid = validateNewPassword(newPassword);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    if (!isNewValid || !isConfirmValid) return;

    if (!oobCode) {
      toast.error("Invalid or expired reset link.");
      return;
    }

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast.success("Password updated successfully! Redirecting to login...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset password. Link may have expired.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl text-center font-semibold mb-6 text-gray-500">
          Reset Your Password
        </h2>

        <form className="flex flex-col gap-3" onSubmit={handleResetPassword}>
          {/* New Password */}
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
          {newPasswordError && (
            <p className="text-red-500 text-sm mb-2">{newPasswordError}</p>
          )}

          {/* Confirm Password */}
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
          {confirmPasswordError && (
            <p className="text-red-500 text-sm mb-2">{confirmPasswordError}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-indigo-500 text-white font-medium hover:opacity-90 transition-opacity mt-3"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
