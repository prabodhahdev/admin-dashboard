// src/context/UserContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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

  // Fetch all users (active only, backend filters isDeleted)
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`);
      setUsers(res.data); // backend already excludes soft-deleted users
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  // Fetch current user and handle account lock / soft delete
  const fetchCurrentUser = async (uid) => {
    try {
      const idToken = await auth.currentUser.getIdToken(true);
      const res = await axios.get(`${API_URL}/users/${uid}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      const user = res.data;

      // 🔹 Immediate logout if account locked or soft-deleted
      if (user.isLocked || user.isDeleted) {
        toast.error(
          user.isDeleted
            ? "Your account has been deleted. Logging out..."
            : "Your account has been locked. Logging out..."
        );
        await logout();
        return;
      }

      const role = user.role || { roleName: "user", permissions: {} };
      setCurrentUser({ ...user, role, permissions: role.permissions || {} });

      if (role.permissions.manageUsers) await fetchUsers();
      await fetchRoles();
    } catch (err) {
      console.error("Error fetching current user:", err);

      if (err.response?.status === 403 || err.response?.status === 401) {
        await logout();
      } else {
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Real-time lock & soft-delete check every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentUser && auth.currentUser) {
        try {
          const idToken = await auth.currentUser.getIdToken(true);
          const res = await axios.get(`${API_URL}/users/${currentUser.uid}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.data.isLocked || res.data.isDeleted) {
            toast.error(
              res.data.isDeleted
                ? "Your account has been deleted. Logging out..."
                : "Your account has been locked. Logging out..."
            );
            await logout();
          }
        } catch (err) {
          console.error("Error checking lock/delete status:", err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentUser, auth.currentUser]);

  // Monitor Firebase auth state
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
