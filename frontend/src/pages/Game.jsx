
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useGamepad from "../hooks/useGamepad";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

const Game = () => {
    const { user } = useAuth();
    const { roomCode } = useParams();

    const [players, setPlayers] = useState([]);
    const [racePrompts, setRacePrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

    const [raceTime, setRaceTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [finishTime, setFinishTime] = useState(null);
    const [finalTime, setFinalTime] = useState(null);

    const [penaltyTime, setPenaltyTime] = useState(0);
    const [wrongInputs, setWrongInputs] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    const [results, setResults] = useState(null);
    const [error, setError] = useState("");
    const [gameOverMessage, setGameOverMessage] = useState("");

    useEffect(() => {
        if (!user || !roomCode) return;

        const handleConnect = () => {
            socket.emit("joinRoom", {
                roomCode,
                userId: user._id
            });
        };

        const handleGameStarted = (data) => {
            setRacePrompts(data.prompts);
            setCurrentPromptIndex(0);

            setRaceTime(0);
            setStartTime(Date.now());
            setFinishTime(null);
            setFinalTime(null);

            setPenaltyTime(0);
            setWrongInputs(0);

            setGameStarted(true);
            setTimedOut(false);
            setResults(null);
            setError("");
            setGameOverMessage("");
        };

        const handleQteCorrect = (data) => {
            setCurrentPromptIndex(data.promptIndex);
        };

        const handleQteWrong = (data) => {
            setWrongInputs(data.wrongInputs);
            setPenaltyTime(data.penaltyTime);
        };

        const handlePlayerFinished = (data) => {
            if (data.userId.toString() === user._id.toString()) {
                setFinishTime(Date.now());
                setGameStarted(false);
            }
        };

        const handlePlayerTimedOut = (data) => {
            if (data.userId.toString() === user._id.toString()) {
                setGameStarted(false);
                setTimedOut(true);
                setGameOverMessage(
                    "Time's up! You took too long to finish."
                );
            }
        };

        const handleRaceResults = (data) => {
            setResults(data.results);
            setGameStarted(false);
            setGameOverMessage("");
        };

        const handleGameOver = (data) => {
            if (data.winner === "opponentDisconnected") {
                setGameStarted(false);
                setGameOverMessage(
                    "You win! Your opponent disconnected."
                );
            }
        };

        const handlePlayerListUpdated = (data) => {
            setPlayers(data.players);
        };

        const handleRoomError = (message) => {
            setError(
                typeof message === "string"
                    ? message
                    : message?.message || "A room error occurred."
            );
        };

        const handleGameError = (message) => {
            setError(
                typeof message === "string"
                    ? message
                    : message?.message || "A game error occurred."
            );
        };

        const handleDisconnect = () => {
            console.log("Socket disconnected");
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
        socket.on("raceResults", handleRaceResults);

        if (socket.connected) {
            handleConnect();
        }

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
            socket.off("raceResults", handleRaceResults);
        };
    }, [user, roomCode]);

    const handleGamepadInput = (pressedKey) => {
        if (!gameStarted || finishTime !== null || timedOut) {
            return;
        }

        socket.emit("qteInput", { key: pressedKey });
    };

    useGamepad(
        handleGamepadInput,
        gameStarted && finishTime === null && !timedOut
    );

    const currentPrompt = racePrompts[currentPromptIndex];

    const { connected: controllerConnected } = useGamepad(
        handleGamepadInput,
        gameStarted && finishTime === null && !timedOut
    );

    // Keyboard input
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!gameStarted || finishTime !== null || timedOut) {
                return;
            }

            let pressedKey;

            if (event.code === "Space") {
                pressedKey = "SPACE";
                event.preventDefault();
            } else {
                pressedKey = event.key.toUpperCase();
            }

            socket.emit("qteInput", { key: pressedKey });
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameStarted, finishTime, timedOut]);

    // Race timer
    useEffect(() => {
        if (!gameStarted || startTime === null) return;

        const timer = setInterval(() => {
            setRaceTime(Date.now() - startTime);
        }, 10);

        return () => clearInterval(timer);
    }, [gameStarted, startTime]);

    // Calculate this player's final time
    useEffect(() => {
        if (finishTime === null || startTime === null) return;

        setFinalTime(
            (finishTime - startTime) + penaltyTime
        );
    }, [finishTime, startTime, penaltyTime]);

    // Error screen
    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error}</p>
                <button onClick={() => setError("")}>
                    Dismiss
                </button>
            </div>
        );
    }

    // Final multiplayer results
    if (results) {
        const myResult = results.find(
            (result) =>
                result.userId.toString() === user._id.toString()
        );

        return (
            <div>
                <h1>Race Results</h1>

                {myResult && (
                    <h2>
                        {myResult.rank === 1
                            ? "You Win!"
                            : "Race Finished!"}
                    </h2>
                )}

                {results.map((result) => (
                    <div
                        key={result.userId}
                        style={{
                            border: "1px solid #ccc",
                            padding: "12px",
                            marginBottom: "12px"
                        }}
                    >
                        <h2>
                            #{result.rank} — {result.username}
                        </h2>

                        <p>
                            {result.timedOut
                                ? "Timed out"
                                : "Completed all 50 prompts"}
                        </p>

                        <p>
                            Final Time:{" "}
                            {(result.finalTime / 1000).toFixed(2)}s
                        </p>

                        <p>
                            Wrong Inputs: {result.wrongInputs}
                        </p>
                    </div>
                ))}
            </div>
        );
    }

    // Timeout or disconnection message
    if (gameOverMessage) {
        return (
            <div>
                <h1>{gameOverMessage}</h1>
            </div>
        );
    }

    // This player's local finish screen while waiting for opponent
    if (finalTime !== null) {
        return (
            <div>
                <h1>You Finished!</h1>
                <h2>
                    Your Time: {(finalTime / 1000).toFixed(2)}s
                </h2>
                <p>Wrong Inputs: {wrongInputs}</p>
                <p>Waiting for your opponent to finish...</p>
            </div>
        );
    }

    return (
        <div>
            {!gameStarted && (
                <div>
                    <h1>Waiting Lobby</h1>
                    <h2>Players: {players.length}</h2>
                    <p>
                        Controller: {controllerConnected ? "Connected" : "Not detected"}
                    </p>

                    {players.map((player) => (
                        <div key={player._id}>
                            {player.username}
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            setError("");
                            socket.emit("startGame");
                        }}
                        disabled={players.length < 2}
                    >
                        {players.length < 2
                            ? "Waiting for player..."
                            : "Start Game"}
                    </button>
                </div>
            )}

            {gameStarted && (
                <div>
                    <h1>Race Mode</h1>

                    <h2>
                        Prompt {currentPromptIndex + 1} / 50
                    </h2>

                    {currentPrompt && (
                        <h1>Press: {currentPrompt.key}</h1>
                    )}

                    <p>
                        Time:{" "}
                        {((raceTime + penaltyTime) / 1000).toFixed(2)}s
                    </p>

                    <p>Wrong Inputs: {wrongInputs}</p>
                </div>
            )}
        </div>
    );
};

export default Game;
