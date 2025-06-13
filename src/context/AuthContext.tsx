import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

// User interface based on your response from the backend
interface User {
  email: string;
  isVerified: boolean;
  name: string;
  password: string; // Consider not storing plain passwords; if needed, store hash
  role: string;
  studentNumber: string;
  surname: string;
  token: string;
  _id: string;
  __v: number;
}

// AuthContext interface with User
interface AuthContextState {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log(token);
    if (token) {
      const userData = JSON.parse(token); // Example; adjust if storing full object
      setUser(userData);
      axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("authToken", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    // Navigate to login - add navigate function if needed
    // navigate("/login");
  };

  return <AuthContext.Provider value={{ user, setUser, logout }}>{children}</AuthContext.Provider>;
};
