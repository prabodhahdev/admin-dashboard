// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const API_URL = process.env.REACT_APP_API_URL;

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to safely check permissions
  const hasPermission = (permission) => {
    return currentUser?.role?.permissions?.[permission] || false;
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUsers([]);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      const res = await axios.get(`${API_URL}/roles`);
      setRoles(res.data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  };

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Fetch current user
const fetchCurrentUser = async (uid) => {
  try {
    console.log("Fetching current user with UID:", uid); // 🔹 log UID

    const res = await axios.get(`${API_URL}/users/${uid}`);
    const user = res.data;
    console.log("Fetched current user:", user); // 🔹 log result

    // Ensure role and permissions exist
    const role = user.role || { roleName: "user", permissions: {} };
    setCurrentUser({ ...user, role, permissions: role.permissions || {} });

    // Fetch all users if current user can manage users
    if (role.permissions.manageUsers) {
      await fetchUsers();
    }

    await fetchRoles();
  } catch (err) {
    console.error("Error fetching current user:", err);
    setCurrentUser(null);
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCurrentUser(user.uid);
      } else {
        setCurrentUser(null);
        setUsers([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        roles,
        setRoles,
        loading,
        hasPermission,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
