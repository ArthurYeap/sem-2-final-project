import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateRoom = () => {
    const navigate = useNavigate();

    const [roomCode, setRoomCode] = useState("");
    const [difficulty, setDifficulty] = useState("normal");
    const [error, setError] = useState("");

    const handleCreateRoom = async (event) => {
        event.preventDefault();

        try {
            setError("");

            const response = await api.post("/rooms", {
                roomCode,
                difficulty
            });

            console.log("Room created:", response.data);

            navigate(`/game/${response.data.roomCode}`);

        } catch (error) {
            console.error(
                "Failed to create room:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create room"
            );
        }
    };

    return (
        <div>
            <h1>Create Room</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleCreateRoom}>

                <div>
                    <label>Room Code</label>

                    <input
                        type="text"
                        value={roomCode}
                        onChange={(event) =>
                            setRoomCode(event.target.value.toUpperCase())
                        }
                        placeholder="ABC123"
                    />
                </div>

                <div>
                    <label>Difficulty</label>

                    <select
                        value={difficulty}
                        onChange={(event) =>
                            setDifficulty(event.target.value)
                        }
                    >
                        <option value="normal">Normal</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>

                <button type="submit">
                    Create Room
                </button>

            </form>
        </div>
    );
};

export default CreateRoom;