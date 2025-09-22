import React, { useState } from "react";
import { auth, db } from "../../firebase/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import axios from "axios";

const ForgotPassword = () => {
    const API_URL = process.env.REACT_APP_API_URL;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // email regex for format validation
  const validateEmailFormat = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Validate format
    if (!email) {
      setError("Please enter your registered email.");
      toast.error("Please enter your registered email.");
      return;
    }
    if (!validateEmailFormat(email)) {
      setError("Invalid email format.");
      toast.error("Invalid email format.");
      return;
    }

    try {
      

      // 3. Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: "http://localhost:3000/reset-password", // redirect URL
        handleCodeInApp: true,
      });

      toast.success("Password reset link sent to your email!");
      setError("");
      setEmail(""); // clear field
    } catch (err) {
      setError(err.message);
      if (err.code === "auth/user-not-found") {
        toast.error("Email not found. Please check or register first.");
      } else {
        toast.error(err.message);
      }
      console.error("Error sending password reset email:", err);
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
            className="w-full h-12 rounded-lg bg-indigo-500 text-white font-medium hover:opacity-90 transition-opacity mt-3"
          >
            Send Reset Link
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
