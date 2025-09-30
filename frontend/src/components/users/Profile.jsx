// src/components/admin/Profile.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ChangePassword from "../auth/ChangePassword";

const Profile = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    profilePic: null,
  });
  const [previewPic, setPreviewPic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Track Firebase user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Populate form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        phone: currentUser.phone || "",
        email: currentUser.email || "",
        profilePic: currentUser.profilePic || null,
      });
      setPreviewPic(currentUser.profilePic || null);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image too large. Max ${MAX_SIZE_MB}MB`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewPic(e.target.result);
      setFormData({ ...formData, profilePic: e.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !firebaseUser) {
      toast.error("You are not logged in.");
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const token = await firebaseUser.getIdToken();

      const res = await axios.put(
        `${API_URL}/users/profile/${currentUser.uid}`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          profilePic: formData.profilePic,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCurrentUser(res.data.user);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(
        err.response?.data?.error || "Error updating profile. Check console."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="flex flex-1 w-3/4 p-6">
      <div className="w-full bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Profile</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Edit Profile
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
        <p
          onClick={() => setShowChangePassword(true)}
          className="text-indigo-600 cursor-pointer mb-4 underline w-max"
        >
          Change Password
        </p>
        {showChangePassword && (
          <ChangePassword onClose={() => setShowChangePassword(false)} />
        )}

        {/* Profile Picture */}
        <div className="flex items-center gap-4 mb-6">
          <img
            src={previewPic || "https://www.w3schools.com/howto/img_avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full border object-cover"
          />
          {isEditing && (
            <label className="text-sm text-indigo-600 cursor-pointer">
              <span className="underline">Change Picture</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              readOnly
              className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
            />
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border p-2 rounded ${
                !isEditing && "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border p-2 rounded ${
                !isEditing && "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`w-full border p-2 rounded ${
                !isEditing && "bg-gray-100 cursor-not-allowed"
              }`}
            />
          </div>

          {isEditing && (
            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-1/4 bg-green-600 text-white p-2 rounded hover:bg-green-700"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;
