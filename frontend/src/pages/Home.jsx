import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div>
            <h1>Welcome to the QTE Game</h1>

            <p>Welcome, {user.username}</p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
};

export default Home;