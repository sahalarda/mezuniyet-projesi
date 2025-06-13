import axios from "axios";
import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AuthLogsList from "./components/AuthLogs/AuthLogs";
import Navbar from "./components/Navbar/Navbar";
import StajForm from "./components/StajForm/StajFrom";
import UploadProject from "./components/StudentHomepage/UploadProject";
import UploadedDocs from "./components/UploadedDocs/UploadedDocs";
import { useAuth } from "./context/AuthContext";
import "./index.css";
import AdminUserList from "./pages/AdminUserList/AdminUserList";
import Home from "./pages/HomePage/Home";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

console.log(import.meta.env.VITE_API_EXTERNAL_URL, import.meta.env.VITE_ANON_KEY);
// export const supabase = createClient(import.meta.env.VITE_API_EXTERNAL_URL, import.meta.env.VITE_ANON_KEY);

// Use environment variable for API URL, fallback to localhost for development
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function App() {
  const { user, logout } = useAuth();

  useEffect(() => {
    // Add response interceptor to handle 401 errors
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // If we get a 401 error, log the user out
          toast.error("Session expired. Please log in again.");
          logout();
        }
        return Promise.reject(error);
      }
    );

    // Clean up the interceptor on component unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <>
          <Navbar />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/auth-logs" element={<AuthLogsList />} />
            <Route path="/staj-form" element={<StajForm />} />
            <Route path="/upload-project" element={<UploadProject />} />
            <Route path="/uploaded-docs" element={<UploadedDocs />} />
            {user?.role === "Admin" && <Route path="/admin/users" element={<AdminUserList />} />}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </>
      )}
      <ToastContainer position="top-right" />
    </>
  );
}
