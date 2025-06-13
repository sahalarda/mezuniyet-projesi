import StudentProfile from "../../components/StudentProfile/StudentProfile";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      {user?.role === "Student" && <StudentProfile />}
    </div>
  );
};

export default Home;
