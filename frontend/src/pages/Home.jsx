import { useState } from "react"; // 1. Added useState to handle the input text
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 2. Added state to track the typed room code
    const [roomCode, setRoomCode] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // 3. Added a handler function to process the room joining logic
    const handleJoinRoom = (e) => {
        e.preventDefault(); // Prevents page reload if wrapped in a form
        if (roomCode.trim()) {
            navigate(`/game/${roomCode.trim()}`);
        }
    };

    return (
        <div>
            <h1>Welcome to the QTE Game</h1>

            <p>Welcome, {user.username}</p>

            <button onClick={handleLogout}>
                Logout
            </button>

            <br/><br />

            {/* 4. Added the Room Code Input and Button Container */}
            <div style={{ margin: "15px 0" }}>
                <h3>Join a Multiplayer Room</h3>
                <input
                    type="text"
                    placeholder="Enter Room Code..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    style={{ padding: "5px", marginRight: "10px" }}
                />
                <button onClick={handleJoinRoom} disabled={!roomCode.trim()}>
                    Join Room
                </button>
            </div>

            <br />
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
