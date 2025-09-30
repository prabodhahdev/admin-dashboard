import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth } from "../../firebase/firebase";
import { toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

const AuthForm = ({ mode }) => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // state for errors for each field
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect based on role
  const redirectBasedOnRole = (role) => {
    if (role === "superadmin") navigate("/superadmin-dashboard");
    // else if (role === "admin") navigate("/admin-dashboard");
    else navigate("/dashboard");
  };

  const API_URL = process.env.REACT_APP_API_URL;

  // ================================ Form Validation Functions ============================================
  // Functions to validate each input field (first name, last name, email, phone, password, confirm password)
  const validateFirstName = (value) => {
    const regex = /^[A-Za-z]{2,50}$/;
    setFirstNameError(
      regex.test(value) ? "" : "First name must be 2-50 alphabets only"
    );
  };

  const validateLastName = (value) => {
    const regex = /^[A-Za-z]{2,50}$/;
    setLastNameError(
      regex.test(value) ? "" : "Last name must be 2-50 alphabets only"
    );
  };

  const validateEmail = (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(regex.test(value) ? "" : "Invalid email format");
  };

  const validatePhone = (value) => {
    const regex = /^(\+\d{1,3})?\d{10,15}$/;
    setPhoneError(
      regex.test(value)
        ? ""
        : "Phone number must be 10–15 digits (with optional country code like +94)"
    );
  };

  const validatePassword = (value) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    setPasswordError(
      regex.test(value)
        ? ""
        : "Password must include uppercase, lowercase, number, special character, min 8 chars"
    );
  };

  const validateConfirmPassword = (value) => {
    setConfirmPasswordError(value === password ? "" : "Passwords do not match");
  };

  // ================================ Account Lock Handling ============================================
  // Checks if the account is currently locked, prevents login if locked,
  // auto-unlocks if lock duration passed and no admin unlock required
  // NOTE: When manually unlocking a user account as an admin, make sure to update the following fields:
  // isLocked: false
  // adminUnlockRequired: false
  // lockoutCount: 0
  // failedAttempts: 0
  // lockUntil: null
  // This ensures the account can log in normally and automatic lock logic works as expected.

  // ================================ Form Handling ====================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ================= Signup Mode =================
    if (mode === "signup") {
      validateFirstName(firstName);
      validateLastName(lastName);
      validateEmail(email);
      validatePhone(phone);
      validatePassword(password);
      validateConfirmPassword(confirmPassword);

      if (
        firstNameError ||
        lastNameError ||
        emailError ||
        phoneError ||
        passwordError ||
        confirmPasswordError
      ) {
        setError("Please fix the errors above");
        toast.error("Please fix the display errors");
        return;
      }

      try {
        // 1️ Firebase Auth signup
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // 2️ Get Firebase ID token
        const idToken = await user.getIdToken();

        // 3️ Send user data to backend (MongoDB)
        const payload = {
          uid: user.uid,
          firstName,
          lastName,
          phone,
          email,
          roleName: "user", // default role
        };
        await axios.post(`${API_URL}/users/signup`, payload, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        // 4️ Send email verification
        await sendEmailVerification(user, {
          url: "http://localhost:3000",
          handleCodeInApp: true,
        });

        // 5️ Store ID token in storage
        if (rememberMe) {
          localStorage.setItem("idToken", idToken);
        } else {
          sessionStorage.setItem("idToken", idToken);
        }

        toast.success("Registration successful! Please verify your email.");
        setError("Verification email sent. Please check your inbox.");
        navigate("/");

        // Clear form
        setFirstName("");
        setLastName("");
        setPhone("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } catch (err) {
        console.log(err);
        if (err.code === "auth/email-already-in-use") {
          setError(
            "This email is already registered. Please log in or use another email."
          );
          toast.error("This email is already registered.");
        } else if (err.response?.data?.error) {
          setError(err.response.data.error);
          toast.error(err.response.data.error);
        } else {
          setError(err.message);
          toast.error(err.message);
        }
      }
    }

    // ================= Login Mode =================
    else {
      try {
        let uid;

        // 1️ Try Firebase login to get UID
        let firebaseUser;
        try {
          const tempCred = await signInWithEmailAndPassword(
            auth,
            email,
            password
          );
          firebaseUser = tempCred.user;
          uid = firebaseUser.uid;
          console.log("[Login] Firebase login success, UID:", uid);
        } catch (firebaseErr) {
          console.warn("[Login] Firebase login failed:", firebaseErr.code);

          // If Firebase login fails, fetch UID from backend by email
          try {
            const userByEmailRes = await axios.get(
              `${API_URL}/users/email/${email}`
            );
            const userDataByEmail = userByEmailRes.data;
            if (!userDataByEmail) {
              toast.error("User not found.");
              console.log(
                "[Login] User not found in backend for email:",
                email
              );
              return;
            }
            uid = userDataByEmail.uid;
            console.log("[Login] UID fetched from backend:", uid);
          } catch (backendErr) {
            console.error(
              "[Login] Failed to fetch UID from backend:",
              backendErr
            );
            toast.error("Cannot find user account.");
            return;
          }
        }

        // 2️ Check account lock status
        const lockRes = await axios.get(`${API_URL}/users/lock-status/${uid}`);
        const lockData = lockRes.data;
        console.log("[Login] Lock status:", lockData);

        if (lockData.isLocked) {
          if (lockData.adminUnlockRequired) {
            toast.error("Your account is locked. Contact admin.");
          } else {
            toast.error("Your account is temporarily locked. Try again later.");
          }
          return; // stop login attempt
        }

        // 3️ Attempt Firebase login if not already successful
        if (!firebaseUser) {
          try {
            const cred = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );
            firebaseUser = cred.user;
            uid = firebaseUser.uid;
            console.log("[Login] Firebase login success on retry, UID:", uid);
          } catch (firebaseRetryErr) {
            console.error(
              "[Login] Firebase login failed again:",
              firebaseRetryErr
            );

            // Record failed attempt in backend
            try {
              await axios.put(`${API_URL}/users/${uid}/failedAttempt`);
              console.log("[Login] Failed attempt recorded for UID:", uid);
            } catch (apiErr) {
              console.error("[Login] Failed to record login attempt:", apiErr);
            }

            // Show proper error toast
            if (
              firebaseRetryErr.code === "auth/user-not-found" ||
              firebaseRetryErr.code === "auth/wrong-password" ||
              firebaseRetryErr.code === "auth/invalid-credential"
            ) {
              toast.error("Invalid username or password.");
              setEmail("");
              setPassword("");
            } else if (firebaseRetryErr.code === "auth/too-many-requests") {
              toast.error("Too many login attempts. Try again later.");
            } else {
              toast.error(firebaseRetryErr.message);
            }
            return;
          }
        }

        // 4️ Check email verification
        if (!firebaseUser.emailVerified) {
          toast.error("Email not verified yet.");
          return;
        }

        const idToken = await firebaseUser.getIdToken();

        // 5️ Fetch full profile from MongoDB
        const profileRes = await axios.get(`${API_URL}/users/${uid}`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const userData = profileRes.data;

        if (!userData) {
          toast.error("User not found in database.");
          return;
        }

        // 6️ Reset failed attempts after successful login
        await axios.put(`${API_URL}/users/${uid}/resetAttempts`, null, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        console.log("[Login] Failed attempts reset for UID:", uid);

        // 7️ Store ID token
        if (rememberMe) localStorage.setItem("idToken", idToken);
        else sessionStorage.setItem("idToken", idToken);

        toast.success("Login successful!");
        redirectBasedOnRole(userData.role?.roleName?.toLowerCase() || "user");
      } catch (err) {
        console.error("[Login] Unexpected error:", err);
        toast.error(err.response?.data?.error || err.message);
      }
    }
  };

  return (
    <div className="auth-form flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 ">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl text-center font-semibold mb-6 text-gray-500 ">
          {mode === "signup"
            ? "Let's get your account set up"
            : "Log in to your account"}
        </h2>

        <form
          className="md:w-96 w-full flex flex-col items-center"
          onSubmit={handleSubmit}
        >
          {/* Signup Fields */}
          {mode === "signup" && (
            <>
              {/* First Name */}
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  validateFirstName(e.target.value);
                }}
                className="w-full h-12 px-4 mb-3 border border-gray-300 rounded-lg outline-none"
                required
              />
              {firstNameError && (
                <p className="text-red-500 text-sm mb-2">{firstNameError}</p>
              )}
              {/* Last Name */}
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  validateLastName(e.target.value);
                }}
                className="w-full h-12 px-4 mb-3 border border-gray-300 rounded-lg outline-none"
                required
              />
              {lastName && (
                <p className="text-red-500 text-sm mb-2">{lastNameError}</p>
              )}
              {/* Phone Number */}
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  validatePhone(e.target.value);
                }}
                className="w-full h-12 px-4 mb-3 border border-gray-300 rounded-lg outline-none"
                required
              />
              {phoneError && (
                <p className="text-red-500 text-sm mb-2">{phoneError}</p>
              )}
            </>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (mode === "signup") validateEmail(e.target.value);
            }}
            className="w-full h-12 px-4 mb-3 border border-gray-300 rounded-lg outline-none"
            required
          />
          {mode === "signup" && emailError && (
            <p className="text-red-500 text-sm mb-2">{emailError}</p>
          )}

          {/* Password */}
          <div className="relative w-full mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (mode === "signup") validatePassword(e.target.value);
              }}
              className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-lg outline-none"
              required
            />
            {/* Eye Icon */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
            >
              {showPassword ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeSlashIcon className="w-4 h-4" />
              )}
            </button>
          </div>
          {mode === "signup" && passwordError && (
            <p className="text-red-500 text-sm mb-2">{passwordError}</p>
          )}

          {/* Only show for login mode */}
          {mode === "login" && (
            <div className="w-full flex items-center justify-between mt-4 text-gray-500/80">
              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  className="h-5 w-5"
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="text-sm" htmlFor="remember">
                  Remember me
                </label>
              </div>
              <a
                className="text-sm underline hover:text-indigo-500"
                href="/forgot-password"
              >
                Forgot password?
              </a>
            </div>
          )}

          {/* Confirm Password Input*/}
          {mode === "signup" && (
            <div className="relative w-full mb-3">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateConfirmPassword(e.target.value);
                }}
                className="w-full h-12 px-4 pr-10 border border-gray-300 rounded-lg outline-none"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-500"
                onMouseDown={() => setShowConfirmPassword(true)}
                onMouseUp={() => setShowConfirmPassword(false)}
                onMouseLeave={() => setShowConfirmPassword(false)}
              >
                {showConfirmPassword ? (
                  <EyeIcon className="w-4 h-4" />
                ) : (
                  <EyeSlashIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
          {confirmPasswordError && (
            <p className="text-red-500 text-sm mb-2">{confirmPasswordError}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-12 rounded-lg bg-indigo-500 text-white font-medium hover:opacity-90 transition-opacity mt-3"
          >
            {mode === "signup" ? "Sign Up" : "Login Now"}
          </button>

          {/* Link to switch forms */}
          <p className="text-gray-500 text-sm mt-4">
            {mode === "signup"
              ? "Already have an account? "
              : "Don’t have an account? "}
            <a
              href={mode === "signup" ? "/" : "/register"}
              className="text-indigo-500 hover:underline"
            >
              {mode === "signup" ? "Login" : "Sign up"}
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
