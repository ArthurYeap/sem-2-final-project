import { useEffect, useState } from "react";
import api from "../api/axios";

const GameHistory = () => {
    const [games, setGames] = useState([]);
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchGames = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/games");
                setGames(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load game history."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchGames();
    }, []);

    const filteredGames = games.filter((game) => {
        if (filter === "all") return true;
        return game.mode === filter;
    });

    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor(
            (milliseconds % 1000) / 10
        );

        return `${String(minutes).padStart(2, "0")}:${String(
    seconds
).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
    };

    if (loading) {
        return <p>Loading game history...</p>;
    }

    return (
        <div>
            <h1>Game History</h1>

            {error && <p>{error}</p>}

            <label htmlFor="game-filter">Filter by mode: </label>

            <select
                id="game-filter"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
            >
                <option value="all">All Games</option>
                <option value="singleplayer">Singleplayer</option>
                <option value="multiplayer">Multiplayer</option>
            </select>

            {filteredGames.length === 0 ? (
                <p>No game history found.</p>
            ) : (
                <div>
                    {filteredGames.map((game) => (
                        <div key={game._id}>
                            <hr />

                            <h2>
                                {game.mode === "singleplayer"
                                    ? "Singleplayer"
                                    : "Multiplayer"}
                            </h2>

                            <p>
                                Final Time: {formatTime(game.finalTime)}
                            </p>

                            <p>
                                Wrong Inputs: {game.wrongInputs}
                            </p>

                            <p>
                                Status: {game.timedOut
                                    ? "Timed Out"
                                    : "Completed"}
                            </p>

                            {game.mode === "multiplayer" &&
                                game.rank != null && (
                                    <p>Rank: {game.rank}</p>
                                )}

                            <p>
                                Played:{" "}
                                {new Date(game.completedAt).toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GameHistory;
