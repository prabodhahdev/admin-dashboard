// src/components/admin/ForgotPassword.jsx
import React, { useState } from "react";
import { auth } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import axios from "axios";

const ForgotPassword = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmailFormat = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your registered email.");
      return;
    }
    if (!validateEmailFormat(email)) {
      toast.error("Invalid email format.");
      return;
    }

    setLoading(true);

    try {
      // 1️ Check if email exists in database
      const res = await axios.get(
        `${API_URL}/users/email/${encodeURIComponent(email)}`
      );
      const user = res.data;

      if (!user) {
        toast.error("Email not found. Please check or register first.");
        setLoading(false);
        return;
      }

      // 2️ Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:3000/reset-password", // redirect URL after reset
        handleCodeInApp: true,
      });

      toast.success("Password reset link sent to your email!");
      setEmail("");
    } catch (err) {
      console.error("Error in forgot password:", err);
      if (err.response && err.response.status === 404) {
        toast.error("Email not found. Please check or register first.");
      } else {
        toast.error(err.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl text-center font-semibold mb-6 text-gray-500">
          Forgot Password
        </h2>
        <form className="w-full flex flex-col" onSubmit={handleForgotPassword}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 mb-3 border border-gray-300 rounded-lg outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-lg bg-indigo-500 text-white font-medium hover:opacity-90 transition-opacity mt-3"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-4 text-center">
          Back to{" "}
          <a href="/" className="text-indigo-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
