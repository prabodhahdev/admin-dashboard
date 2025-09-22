// src/components/admin/AddUser.jsx
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import "react-toastify/dist/ReactToastify.css";
import { sendPasswordResetEmail, getAuth } from "firebase/auth";
import { useUser } from "../../context/UserContext";

const AddUser = ({ closeModal, onUserAdded }) => {
  const { setUsers } = useUser();

  const [profilePic, setProfilePic] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("");
  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "" });

  const roleLabels = { user: "User", admin: "Admin", superadmin: "Super Admin" };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "firstName":
        if (!/^[A-Za-z]{2,50}$/.test(value)) error = "First name must be 2-50 alphabets";
        break;
      case "lastName":
        if (!/^[A-Za-z]{2,50}$/.test(value)) error = "Last name must be 2-50 alphabets";
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Invalid email format";
        break;
      case "phone":
        if (!/^(\+\d{1,3})?\d{10,15}$/.test(value)) error = "Phone number must be 10–15 digits";
        break;
      case "password":
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(value))
          error = "Password must include uppercase, lowercase, number, special char, min 8 chars";
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setProfilePic(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setProfilePic(null);
    setErrors({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    setRole(roles[0]?.roleName || "user");
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/roles");
        const data = await res.json();
        setRoles(data);
        if (data.length > 0) setRole(data[0].roleName);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load roles");
      }
    };
    fetchRoles();
  }, []);

  const generatePassword = () => {
    const randomPass = Math.random().toString(36).slice(-10) + "Aa1!";
    setPassword(randomPass);
    validateField("password", randomPass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid =
      validateField("firstName", firstName) &&
      validateField("lastName", lastName) &&
      validateField("email", email) &&
      validateField("phone", phone) &&
      validateField("password", password);

    if (!isValid) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, phone, roleName: role, profilePic }),
      });

      let data;
      if (!res.ok) {
        // Try parse JSON; if fails, read as text
        try {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to save user");
        } catch (_) {
          const text = await res.text();
          throw new Error(text || "Failed to save user");
        }
      } else {
        try {
          data = await res.json();
        } catch (_) {
          const text = await res.text();
          throw new Error(text || "Invalid server response");
        }
      }
      const createdUser = data.user;

      // ✅ Update users list directly in context
      setUsers(prev => [createdUser, ...prev]);

      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);

      toast.success("User added & email sent!");
      resetForm();
      if (closeModal) closeModal();
    } catch (error) {
      console.error(error);
      toast.error("Error: " + error.message);
    }
  };

  return (
    <div className="w-full max-w-3xl p-8 bg-white rounded-lg relative">
      <h2 className="text-lg sm:text-xl font-semibold text-gray-500 mb-5">Add New User</h2>

      <div className="flex items-center gap-4 mb-6">
        <img
          src={profilePic || "https://www.w3schools.com/howto/img_avatar.png"}
          alt="Profile"
          className="w-20 h-20 rounded-full border object-cover"
        />
        <label className="text-sm text-indigo-600 cursor-pointer">
          <span className="underline">Change Profile Picture</span>
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
      </div>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        {/* First Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={(e) => validateField("firstName", e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none ${errors.firstName ? "border-red-500" : ""}`}
          />
          {errors.firstName && <span className="text-red-500 text-sm">{errors.firstName}</span>}
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={(e) => validateField("lastName", e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none ${errors.lastName ? "border-red-500" : ""}`}
          />
          {errors.lastName && <span className="text-red-500 text-sm">{errors.lastName}</span>}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={(e) => validateField("email", e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none ${errors.email ? "border-red-500" : ""}`}
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={(e) => validateField("phone", e.target.value)}
            className={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none ${errors.phone ? "border-red-500" : ""}`}
          />
          {errors.phone && <span className="text-red-500 text-sm">{errors.phone}</span>}
        </div>

        {/* Password */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-600 mb-1">Password</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); validateField("password", e.target.value); }}
                className={`w-full border rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-400 outline-none ${errors.password ? "border-red-500" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <button type="button" onClick={generatePassword} className="px-4 py-2 bg-gray-100 border rounded-lg text-sm hover:bg-gray-200 whitespace-nowrap">Generate</button>
          </div>
          {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password}</span>}
        </div>

        {/* Role */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <label className="text-sm font-medium text-gray-600 mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
          >
            {roles.length === 0 ? <option>Loading roles...</option> : roles.map((r) => <option key={r._id} value={r.roleName}>{roleLabels[r.roleName] || r.roleName}</option>)}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4 col-span-1 md:col-span-2 mt-6">
          <button type="submit" className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">Add User</button>
          <button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300">Reset</button>
        </div>
      </form>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </div>
  );
};

export default AddUser;
