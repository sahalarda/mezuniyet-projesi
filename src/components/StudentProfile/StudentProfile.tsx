import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import "./StudentProfile.css";
import axios from "axios";

interface Project {
  id: string;
  title: string;
  score?: number;
}

const StudentProfile = () => {
  const { user } = useAuth();
  const [latestProjectScore, setLatestProjectScore] = useState<
    number | null | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLatestProject = async () => {
      setIsLoading(true);
      setError(null);
      setLatestProjectScore(undefined);
      try {
        // Log the token for debugging
        console.log("Auth token:", user?.token);

        // Make sure to include the authorization token
        const config = {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
        const response = await axios.get(`/api/users/me/projects`, config);
        console.log("Project data:", response.data);
        const project: Project = response.data;
        setLatestProjectScore(project?.score ?? null);
      } catch (err: any) {
        console.error("Error fetching latest project:", err);
        // Log more detailed error information
        if (err.response) {
          console.error(
            "Response error:",
            err.response.status,
            err.response.data
          );
        }
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLatestProjectScore(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.token) {
      fetchLatestProject();
    } else {
      setLatestProjectScore(null);
    }
  }, [user]);

  const renderScore = () => {
    if (isLoading || latestProjectScore === undefined) {
      return <span className="value">Yükleniyor...</span>;
    }
    if (error) {
      return <span className="value error">Skor yüklenemedi</span>;
    }
    if (latestProjectScore === null) {
      return <span className="value">Henüz skor yok</span>;
    }
    return <span className="value">{latestProjectScore}</span>;
  };

  return (
    <div className="student-profile">
      <div className="profile-header">
        <div className="profile-info">
          <h1>Öğrenci Profili</h1>
          <div className="profile-details">
            <div className="info-item">
              <span className="label">İsim:</span>
              <span className="value">
                {user?.name} {user?.surname}
              </span>
            </div>
            <div className="info-item">
              <span className="label">Öğrenci No:</span>
              <span className="value">{user?.studentNumber}</span>
            </div>
            <div className="info-item">
              <span className="label">Bölüm:</span>
              <span className="value">Elektrik Elektronik Mühendisliği</span>
            </div>
            <div className="info-item">
              <span className="label">Proje Notu:</span>
              {renderScore()}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="profile-content">
        <section className="projects-section">
          <h2>Projelerim</h2>
          <p>Henüz proje yüklenmedi.</p>
        </section>
      </div> */}
    </div>
  );
};

export default StudentProfile;
