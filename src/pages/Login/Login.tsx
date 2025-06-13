import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "../../context/AuthContext";
import "./login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const { setUser } = useAuth(); // Obtain the setUser function from the context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/users/login", { email, password });
      const userData = response.data; // Assume that response.data returns the full user info

      // Set user details in context
      setUser(userData);

      toast.success("Giriş başarılı");

      // Navigate to home page after login
      navigate("/home");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error logging in:", error.response?.data);
        toast.error("Geçersiz e-posta veya şifre");
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  const handleSignupClick = () => {
    navigate("/signup");
  };

  return (
    <div className="login-container">
      <div className="login-page">
        <h1 className="login-header">Giriş Yap</h1>
        <form onSubmit={handleSubmit}>
          <div className="login">
            <div className="login-inputs">
              <input type="email" placeholder="E-posta" value={email} onChange={(e) => setEmail(e.target.value)} className="email" />
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="password"
              />
            </div>
            <button className="btn" type="submit">
              Giriş Yap
            </button>
          </div>
        </form>
        <div className="signup-section">
          <p>Hesabınız yoksa,</p>
          <button className="signup-btn" onClick={handleSignupClick}>
            Hesap oluştur
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
