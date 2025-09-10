// import { createContext, useContext, useEffect, useMemo, useState } from 'react';
// import PropTypes from 'prop-types';
// import { toast } from 'react-toastify';
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// const AuthContext = createContext({
//   isAuthenticated: false,
//   token: null,
//   login: async () => {},
//   logout: () => {},
// });

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(null);

//   useEffect(() => {
//     const storedToken = localStorage.getItem('auth_token');
//     if (storedToken) {
//       setToken(storedToken);
//     }
//   }, []);

//   // Verify token on app load and whenever it changes
//   useEffect(() => {
//     const verifyToken = async () => {
//       const activeToken = localStorage.getItem('auth_token');
//       if (!activeToken) return;
//       try {
//         const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
//           headers: { Authorization: `Bearer ${activeToken}` },
//         });
//         if (!res.ok) throw new Error('Invalid token');
//         const data = await res.json();
//         if (!data?.success) throw new Error('Invalid token');
//       } catch {
//         localStorage.removeItem('auth_token');
//         setToken(null);
//       }
//     };
//     verifyToken();
//   }, [token]);

//   const login = async (email, password) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (!response.ok || data?.success !== true || !data?.token) {
//         throw new Error(data?.message || 'Invalid credentials');
//       }

//       localStorage.setItem('auth_token', data.token);
//       setToken(data.token);
//       toast.success('Login successful');
//       return true;
//     } catch (error) {
//       toast.error(error.message || 'Login failed');
//       return false;
//     }
//   };

//   const logout = () => {
//     localStorage.removeItem('auth_token');
//     setToken(null);
//   };

//   const value = useMemo(
//     () => ({ isAuthenticated: Boolean(token), token, login, logout }),
//     [token]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = () => useContext(AuthContext);

// AuthProvider.propTypes = {
//   children: PropTypes.node,
// };


import { createContext, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext({
  isAuthenticated: false,
  token: null,
  login: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // to avoid flickering

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        if (!data?.success) throw new Error("Invalid token");

        setToken(storedToken);
      } catch {
        localStorage.removeItem("auth_token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data?.success !== true || !data?.token) {
        throw new Error(data?.message || "Invalid credentials");
      }

      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      toast.success("Login successful");
      return true;
    } catch (error) {
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
  };

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      token,
      login,
      logout,
      loading,
    }),
    [token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

AuthProvider.propTypes = {
  children: PropTypes.node,
};
