import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {Link} from "react-router-dom";

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
            </button> <br/>
            Link to <Link to="/game-history">Game History</Link>
            <br />
            Link to <Link to="/create-room">Create Room</Link>
            <br />
            Link to <Link to="/singleplayer">Singleplayer</Link>
            <br />
            {user.role === "admin" && (
                <>
                    <ul>
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>
                    </ul>
                </>
            )}
        </div>
    );
};

export default Home;