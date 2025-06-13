import { CiLogout } from "react-icons/ci";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./navbar.css";

const Navbar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActiveRoute = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <Link to="/" className="logo-link">
          <h1>Mezuniyet Projesi</h1>
        </Link>
      </div>

      <ul className="links">
        {user?.role === "Student" && (
          <>
            <Link
              to="/profile"
              className={`navbar-item ${isActiveRoute("/profile")}`}
            >
              Profil
            </Link>
            <div className="divider" />
            <Link
              to="/upload-project"
              className={`navbar-item ${isActiveRoute("/upload-project")}`}
            >
              Proje Yukle
            </Link>
            <div className="divider" />
            <Link
              to="/staj-form"
              className={`navbar-item ${isActiveRoute("/staj-form")}`}
            >
              Staj Formu Yukle
            </Link>
          </>
        )}
        {user?.role === "Teacher" && (
          <>
            <Link
              to="/profile"
              className={`navbar-item ${isActiveRoute("/profile")}`}
            >
              Profil
            </Link>
            <div className="divider" />
            <Link
              to="/uploaded-docs"
              className={`navbar-item ${isActiveRoute("/uploaded-docs")}`}
            >
              Ogrenci Projeleri
            </Link>
            <div className="divider" />
            <Link
              to="/summaries"
              className={`navbar-item ${isActiveRoute("/summaries")}`}
            >
              Ozetleri Gor
            </Link>
          </>
        )}
        {user?.role === "Admin" && (
          <>
            <Link
              to="/auth-logs"
              className={`navbar-item ${isActiveRoute("/auth-logs")}`}
            >
              Kullanici Girisleri
            </Link>
            <div className="divider" />
            <Link
              to="/uploaded-docs"
              className={`navbar-item ${isActiveRoute("/uploaded-docs")}`}
            >
              Yüklenen Belgeler
            </Link>
            <div className="divider" />
            <Link
              to="/admin/users"
              className={`navbar-item ${isActiveRoute("/admin/users")}`}
            >
              Kullanicilar
            </Link>
          </>
        )}
      </ul>
      <button onClick={logout} className="logout-button">
        <span>Cikis Yap</span>
        <CiLogout className="icon" />
      </button>
    </nav>
  );
};

export default Navbar;
