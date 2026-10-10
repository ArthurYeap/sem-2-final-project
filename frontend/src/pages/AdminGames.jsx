
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminGames = () => {
    const [games, setGames] = useState([]);
    const [mode, setMode] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [finalTime, setFinalTime] = useState("");
    const [wrongInputs, setWrongInputs] = useState("");
    const [timedOut, setTimedOut] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchGames = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (mode !== "all") {
                params.mode = mode;
            }

            const response = await api.get("/games", { params });
            setGames(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load game records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, [mode]);

    const handleEdit = (game) => {
        setEditingId(game._id);
        setFinalTime(String(game.finalTime));
        setWrongInputs(String(game.wrongInputs));
        setTimedOut(game.timedOut);
        setError("");
        setMessage("");
    };

    const handleCancel = () => {
        setEditingId(null);
        setFinalTime("");
        setWrongInputs("");
        setTimedOut(false);
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        const time = Number(finalTime);
        const mistakes = Number(wrongInputs);

        if (!finalTime.trim() || !Number.isFinite(time) || time < 0) {
            setError("Final time must be a valid non-negative number.");
            return;
        }

        if (
            !wrongInputs.trim() ||
            !Number.isInteger(mistakes) ||
            mistakes < 0
        ) {
            setError("Wrong inputs must be a non-negative whole number.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await api.put(`/games/${editingId}`, {
                finalTime: time,
                wrongInputs: mistakes,
                timedOut
            });

            const updatedGame = response.data.game;

            setGames((previousGames) =>
                previousGames.map((game) =>
                    game._id === editingId
                        ? { ...game, ...updatedGame }
                        : game
                )
            );

            setMessage("Game record updated successfully.");
            handleCancel();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update game record."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (gameId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this game record?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await api.delete(`/games/${gameId}`);

            setGames((previousGames) =>
                previousGames.filter((game) => game._id !== gameId)
            );

            if (editingId === gameId) {
                handleCancel();
            }

            setMessage("Game record deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete game record."
            );
        }
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = milliseconds / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = (totalSeconds % 60).toFixed(2);

        return `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(5, "0")}`;
    };

    if (loading) {
        return <p>Loading game records...</p>;
    }

    return (
        <div>
            <h1>Game Record Management</h1>

            <p>View and manage game records from all players.</p>

            <p>
                <Link to="/admin">Back to Dashboard</Link>
            </p>

            <div>
                <label htmlFor="gameMode">Filter by mode: </label>

                <select
                    id="gameMode"
                    value={mode}
                    onChange={(event) => setMode(event.target.value)}
                >
                    <option value="all">All Games</option>
                    <option value="singleplayer">Singleplayer</option>
                    <option value="multiplayer">Multiplayer</option>
                </select>
            </div>

            {error && <p role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}

            {games.length === 0 ? (
                <p>No game records found.</p>
            ) : (
                games.map((game) => (
                    <div
                        key={game._id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "12px",
                            margin: "12px 0",
                            borderRadius: "8px"
                        }}
                    >
                        <h3>{game.userId?.username || "Unknown Player"}</h3>

                        <p>
                            <strong>Mode:</strong> {game.mode}
                        </p>

                        <p>
                            <strong>Final Time:</strong>{" "}
                            {formatTime(game.finalTime)}
                        </p>

                        <p>
                            <strong>Wrong Inputs:</strong> {game.wrongInputs}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {game.timedOut ? "Timed Out" : "Completed"}
                        </p>

                        {game.mode === "multiplayer" && (
                            <>
                                <p>
                                    <strong>Rank:</strong>{" "}
                                    {game.rank ?? "Not recorded"}
                                </p>
                                <p>
                                    <strong>Room:</strong>{" "}
                                    {game.roomId?.roomCode || "Unavailable"}
                                </p>
                            </>
                        )}

                        <p>
                            <strong>Played At:</strong>{" "}
                            {game.completedAt
                                ? new Date(game.completedAt).toLocaleString()
                                : "Unknown"}
                        </p>

                        <button
                            type="button"
                            onClick={() => handleEdit(game)}
                        >
                            Edit Record
                        </button>{" "}

                        <button
                            type="button"
                            onClick={() => handleDelete(game._id)}
                        >
                            Delete Record
                        </button>

                        {editingId === game._id && (
                            <form onSubmit={handleUpdate}>
                                <h4>Edit Game Record</h4>

                                <div>
                                    <label htmlFor="finalTime">
                                        Final Time (milliseconds)
                                    </label>
                                    <input
                                        id="finalTime"
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={finalTime}
                                        onChange={(event) =>
                                            setFinalTime(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label htmlFor="wrongInputs">
                                        Wrong Inputs
                                    </label>
                                    <input
                                        id="wrongInputs"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={wrongInputs}
                                        onChange={(event) =>
                                            setWrongInputs(event.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div>
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={timedOut}
                                            onChange={(event) =>
                                                setTimedOut(event.target.checked)
                                            }
                                        />
                                        Timed Out
                                    </label>
                                </div>

                                <button type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>{" "}

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                            </form>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminGames;
