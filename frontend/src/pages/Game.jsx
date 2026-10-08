import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

const Game = () => {
    const { user } = useAuth();
    const { roomCode } = useParams();

    const [prompts, setPrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [racePrompts, setRacePrompts] = useState([]);

    const [raceTime, setRaceTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [players, setPlayers] = useState([]);
    const [penaltyTime, setPenaltyTime] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);
    const [wrongInputs, setWrongInputs] = useState(0);
    const [gameOverMessage, setGameOverMessage] = useState("");

    const [finishTime, setFinishTime] = useState(null);
    const [finalTime, setFinalTime] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Socket.IO
    useEffect(() => {
        if (!user) {
            return;
        }

        const handleConnect = () => {
            console.log("Socket connected:", socket.id);

            socket.emit("joinRoom", {
                roomCode: roomCode,
                userId: user._id
            });
        };

        const handleGameStarted = (data) => {
            setRacePrompts(data.prompts);

            setGameOverMessage("");
            setFinishTime(null);
            setFinalTime(null);
            setCurrentPromptIndex(0);
            setRaceTime(0);
            setPenaltyTime(0);
            setWrongInputs(0);

            setGameStarted(true);
            setStartTime(Date.now());
        };

        const handleQteCorrect = (data) => {
            setCurrentPromptIndex(data.promptIndex);
        };

        const handleQteWrong = (data) => {
            setWrongInputs(data.wrongInputs);
            setPenaltyTime(data.penaltyTime);
        };

        const handlePlayerFinished = (data) => {
            console.log("PLAYER FINISHED:", data.userId);

            if (data.userId.toString() === user._id.toString()) {
                setFinishTime(Date.now());
                setGameStarted(false);
            }
        };

        const handlePlayerTimedOut = (data) => {
            console.log("PLAYER TIMED OUT:", data.userId);

            if (data.userId.toString() === user._id.toString()) {
                setGameStarted(false);
                setFinishTime(Date.now());
                setGameOverMessage(
                    "Time's up! You took too long to finish."
                );
            }
        };
        const handleGameOver = (data) => {
            if (data.winner === "opponentDisconnected") {
                setGameOverMessage(
                    "You win! Your opponent disconnected."
                );

                setGameStarted(false);
            }
        };

        const handleDisconnect = () => {
            console.log("Socket disconnected");
        };

        const handlePlayerListUpdated = (data) => {
            console.log("Updated player list:", data.players);

            setPlayers(data.players);
        };

        const handleRoomError = (message) => {
            console.log("Room error:", message);
        };

        const handleGameError = (message) => {
            console.log("Game error:", message);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("playerListUpdated", handlePlayerListUpdated);
        socket.on("roomError", handleRoomError);
        socket.on("gameError", handleGameError);
        socket.on("gameStarted", handleGameStarted);
        socket.on("gameOver", handleGameOver);
        socket.on("playerTimedOut", handlePlayerTimedOut);
        socket.on("qteCorrect", handleQteCorrect);
        socket.on("qteWrong", handleQteWrong);
        socket.on("playerFinished", handlePlayerFinished);

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("playerListUpdated", handlePlayerListUpdated);
            socket.off("roomError", handleRoomError);
            socket.off("gameError", handleGameError);
            socket.off("gameStarted", handleGameStarted);
            socket.off("gameOver", handleGameOver);
            socket.off("playerTimedOut", handlePlayerTimedOut);
            socket.off("qteCorrect", handleQteCorrect);
            socket.off("qteWrong", handleQteWrong);
            socket.off("playerFinished", handlePlayerFinished);
        };
    }, [user]);

    // Fetch QTE prompts
    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const response = await api.get("/qte-prompts");

                setPrompts(response.data);

            } catch (error) {
                console.error("Failed to fetch prompts:", error);

                setError("Failed to load QTE prompts");

            } finally {
                setLoading(false);
            }
        };

        fetchPrompts();
    }, []);

    const currentPrompt = racePrompts[currentPromptIndex];

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!gameStarted || finishTime !== null) {
                return;
            }

            let pressedKey;

            if (event.code === "Space") {
                pressedKey = "SPACE";
                event.preventDefault();
            } else {
                pressedKey = event.key.toUpperCase();
            }

            socket.emit("qteInput", {
                key: pressedKey
            });
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [gameStarted, finishTime]);

    // Start game

    // Timer
    useEffect(() => {
        if (!gameStarted || startTime === null) {
            return;
        }

        const timer = setInterval(() => {
            setRaceTime(Date.now() - startTime);
        }, 10);

        return () => {
            clearInterval(timer);
        };

    }, [gameStarted, startTime]);

    // Calculate final time
    useEffect(() => {
        if (finishTime === null || startTime === null) {
            return;
        }

        const totalTime =
            (finishTime - startTime) + penaltyTime;

        setFinalTime(totalTime);

    }, [finishTime, startTime, penaltyTime]);

    // Save result to backend
    useEffect(() => {
        if (finalTime === null || !user) {
            return;
        }

        const saveGame = async () => {
            try {
                const response = await api.post("/games", {
                    userId: user._id,
                    mode: "singleplayer",
                    finalTime: finalTime,
                    wrongInputs: wrongInputs
                });

                console.log("Game result saved!");
                console.log("Saved game:", response.data);

            } catch (error) {
                console.error(
                    "Failed to save game:",
                    error.response?.data || error
                );
            }
        };

        saveGame();

    }, [finalTime, user, wrongInputs]);

    // Loading
    if (loading) {
        return <h1>Loading prompts...</h1>;
    }

    // Error
    if (error) {
        return <h1>{error}</h1>;
    }

    // Game finished
    if (finalTime !== null) {
        return (
            <div>
                <h1>Race Finished!</h1>

                <h2>
                    Final Time: {(finalTime / 1000).toFixed(2)}s
                </h2>

                <p>
                    Wrong Inputs: {wrongInputs}
                </p>
            </div>
        );
    }

    return (
        <div>

            {/* Waiting Lobby */}
            <div>
                <h1>Waiting Lobby</h1>

                <h2>
                    Players: {players.length}
                </h2>

                {players.map((player) => (
                    <div key={player._id}>
                        {player.username}
                    </div>
                ))}

                {/* Temporary Start Game button */}
                <button
                    onClick={() => socket.emit("startGame")}
                    disabled={players.length < 2 || gameStarted}
                >
                    {players.length < 2
                        ? "Waiting for player..."
                        : gameStarted
                            ? "Game Started"
                            : "Start Game"
                    }
                </button>
            </div>

            {gameOverMessage && (
                <div>
                    <h1>{gameOverMessage}</h1>
                </div>
            )}
            {/* Race */}
            <div>
                <h1>Race Mode</h1>

                <h2>
                    Prompt {currentPromptIndex + 1} / 50
                </h2>

                {currentPrompt && (
                    <h1>
                        Press: {currentPrompt.key}
                    </h1>
                )}

                <p>
                    Time:{" "}
                    {((raceTime + penaltyTime) / 1000).toFixed(2)}s
                </p>

                <p>
                    Wrong Inputs: {wrongInputs}
                </p>
            </div>

        </div>
    );
};

export default Game;
