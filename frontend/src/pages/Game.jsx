
import { useEffect, useState } from "react";
import {
    Link,
    useParams
} from "react-router-dom";
import useGamepad from "../hooks/useGamepad";
import getPromptDisplay from "../utils/getPromptDisplay";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

const Game = () => {
    const { user } = useAuth();
    const { roomCode } = useParams();

    const [players, setPlayers] = useState([]);
    const [racePrompts, setRacePrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

    const [raceTime, setRaceTime] = useState(0);
    const [readyPlayers, setReadyPlayers] = useState([]);
    const [hostId, setHostId] = useState(null);
    const [displayMode, setDisplayMode] = useState("keyboard");
    const [startTime, setStartTime] = useState(null);
    const [difficulty, setDifficulty] = useState("normal");
    const [finishTime, setFinishTime] = useState(null);
    const [finalTime, setFinalTime] = useState(null);

    const [penaltyTime, setPenaltyTime] = useState(0);
    const [wrongInputs, setWrongInputs] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    const [results, setResults] = useState(null);
    const [error, setError] = useState("");
    const [gameOverMessage, setGameOverMessage] = useState("");

    // ! return to room handler
    const handleReturnToRoom = () => {
        setError("");
        socket.emit("returnToRoom");
    };

    const isHost = hostId === user?._id?.toString();

    // ! handle returned to room
    const handleReturnedToRoom = () => {
        console.log("Server confirmed return to room");

        setResults(null);
        setGameOverMessage("");
        setError("");
        setTimedOut(false);
        setFinishTime(null);
        setFinalTime(null);
        setCurrentPromptIndex(0);
        setRaceTime(0);
        setPenaltyTime(0);
        setWrongInputs(0);
        setStartTime(null);
        setGameStarted(false);
        setRacePrompts([]);
        setReadyPlayers([]);
    };

    useEffect(() => {
        if (!user || !roomCode) return;

        // ! join room handler
        const handleConnect = () => {
            socket.emit("joinRoom", {
                roomCode,
                userId: user._id
            });
        };

        // ? handle ready status list update
        const handleReadyStatusUpdated = (data) => {
            setReadyPlayers(data.readyPlayers);
        };

        // ? handle game started
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

        // ? handle QTE correct input
        const handleQteCorrect = (data) => {
            setCurrentPromptIndex(data.promptIndex);
        };

        // * handle QTE wrong input
        const handleQteWrong = (data) => {
            setWrongInputs(data.wrongInputs);
            setPenaltyTime(data.penaltyTime);
        };

        const handlePromptExpired = (data) => {
            if (data.userId !== user._id.toString()) {
                return;
            }

            setCurrentPromptIndex(data.promptIndex);
            setWrongInputs(data.wrongInputs);
            setPenaltyTime(data.penaltyTime);
        };

        const handleDifficultyUpdated = (data) => {
            setDifficulty(data.difficulty);
        };


        const handlePlayerFinished = (data) => {
            if (data.userId.toString() === user._id.toString()) {
                setFinishTime(Date.now());
                setGameStarted(false);
            }
        };

        // * handle player timed out or forfeited
        const handlePlayerTimedOut = (data) => {
            if (data.userId.toString() !== user._id.toString()) {
                return;
            }

            setGameStarted(false);
            setTimedOut(true);

            if (data.forfeited) {
                setGameOverMessage("You forfeited the race.");
            } else {
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
            setReadyPlayers(data.readyPlayers || []);
            setHostId(data.hostId);
            setDifficulty(data.difficulty);
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
        socket.on("promptExpired", handlePromptExpired);
        socket.on("difficultyUpdated", handleDifficultyUpdated);
        socket.on("gameError", handleGameError);
        socket.on("gameStarted", handleGameStarted);
        socket.on("gameOver", handleGameOver);
        socket.on("playerTimedOut", handlePlayerTimedOut);
        socket.on("readyStatusUpdated", handleReadyStatusUpdated);
        socket.on("qteCorrect", handleQteCorrect);
        socket.on("qteWrong", handleQteWrong);
        socket.on("playerFinished", handlePlayerFinished);
        socket.on("raceResults", handleRaceResults);
        socket.on("returnedToRoom", handleReturnedToRoom);

        if (socket.connected) {
            handleConnect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("readyStatusUpdated", handleReadyStatusUpdated);
            socket.off("disconnect", handleDisconnect);
            socket.off("playerListUpdated", handlePlayerListUpdated);
            socket.off("roomError", handleRoomError);
            socket.off("gameError", handleGameError);
            socket.off("difficultyUpdated", handleDifficultyUpdated);
            socket.off("gameStarted", handleGameStarted);
            socket.off("gameOver", handleGameOver);
            socket.off("playerTimedOut", handlePlayerTimedOut);
            socket.off("qteCorrect", handleQteCorrect);
            socket.off("qteWrong", handleQteWrong);
            socket.off("playerFinished", handlePlayerFinished);
            socket.off("promptExpired", handlePromptExpired);
            socket.off("raceResults", handleRaceResults);
            socket.off("returnedToRoom", handleReturnedToRoom);
        };
    }, [user, roomCode]);

    const handleGamepadInput = (pressedKey) => {
        if (!gameStarted || finishTime !== null || timedOut) {
            return;
        }

        socket.emit("qteInput", { key: pressedKey });
    };

    const currentPrompt = racePrompts[currentPromptIndex];

    const myUserId = user?._id?.toString();

    const isReady = readyPlayers.includes(myUserId);

    const everyoneReady =
        players.length >= 2 &&
        players.every((player) =>
            readyPlayers.includes(player._id.toString())
        );

    // ? connect gamepad input
    const { connected: controllerConnected } = useGamepad(
        handleGamepadInput,
        gameStarted && finishTime === null && !timedOut
    );

    // ? set display to keyboard if controller is not connected
    useEffect(() => {
        if (!controllerConnected && displayMode !== "keyboard") {
            setDisplayMode("keyboard");
        }
    }, [controllerConnected, displayMode]);

    useEffect(() => {
    //! Keyboard input handler
        const handleKeyDown = (event) => {
            if (!gameStarted || finishTime !== null || timedOut) {
                return;
            }

            let pressedKey;

            if (event.code === "Space") {
                event.preventDefault();
                pressedKey = "SPACE";
            } else if (event.code === "ArrowUp") {
                event.preventDefault();
                pressedKey = "UP";
            } else if (event.code === "ArrowDown") {
                event.preventDefault();
                pressedKey = "DOWN";
            } else if (event.code === "ArrowLeft") {
                event.preventDefault();
                pressedKey = "LEFT";
            } else if (event.code === "ArrowRight") {
                event.preventDefault();
                pressedKey = "RIGHT";
            } else {
                pressedKey = event.key.toUpperCase();
            }


            socket.emit("qteInput", { key: pressedKey });        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameStarted, finishTime, timedOut]);

    // ? start Race timer
    useEffect(() => {
        if (!gameStarted || startTime === null) return;

        const timer = setInterval(() => {
            setRaceTime(Date.now() - startTime);
        }, 10);

        return () => clearInterval(timer);
    }, [gameStarted, startTime]);

    // *Calculate this player's final time
    useEffect(() => {
        if (finishTime === null || startTime === null) return;

        setFinalTime(
            (finishTime - startTime) + penaltyTime
        );
    }, [finishTime, startTime, penaltyTime]);

// Error Screen
if (error) {
    return (
        <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <section className="border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                        Multiplayer
                    </p>
                    <h1 className="mt-2 text-3xl font-black">Error</h1>
                    <p role="alert" className="mt-4 border-l-4 border-red-600 bg-red-100 p-3 font-semibold text-red-700">
                        {error}
                    </p>
                    <button
                        onClick={() => setError("")}
                        className="mt-6 border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-5 py-3 font-black text-white transition hover:bg-white hover:text-[#85554C]"
                    >
                        Dismiss
                    </button>
                </section>
            </div>
        </main>
    );
}

// Final multiplayer results
if (results) {
    const myResult = results.find(
        (result) =>
            result.userId.toString() === user._id.toString()
    );

    return (
        <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <header className="border-4 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#85554C] sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                        Multiplayer
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                        Race Results
                    </h1>

                    {myResult && (
                        <h2 className="mt-4 text-xl font-black text-[#85554C]">
                            {myResult.rank === 1
                                ? "You Win!"
                                : "Race Finished!"}
                        </h2>
                    )}
                </header>


                <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((result) => (
                        <article
                            key={result.userId}
                            className={`space-y-4 border-4 p-5 shadow-[-5px_5px_0_#85554C] ${
        result.userId.toString() === user._id.toString()
            ? "border-white bg-[#E7C5B1] text-[#85554C]"
            : "border-[#85554C] bg-[#E7C5B1] text-[#85554C]"
    }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <h2 className="break-words text-xl font-black">
                                    #{result.rank} — {result.username}
                                </h2>

                                {result.rank === 1 && (
                                    <span className="shrink-0 border-2 border-[#85554C] bg-white px-2 py-1 text-xs font-black uppercase">
                                        Winner
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 border-t-2 border-[#AD8971] pt-4">
                                <p>
                                    <span className="font-bold">Result:</span>{" "}
                                    {result.forfeited
                                        ? "Forfeited"
                                        : result.timedOut
                                            ? "Timed Out"
                                            : "Completed"}
                                </p>

                                <p>
                                    <span className="font-bold">Final Time:</span>{" "}
                                    {(result.finalTime / 1000).toFixed(2)}s
                                </p>

                                <p>
                                    <span className="font-bold">Wrong Inputs:</span>{" "}
                                    {result.wrongInputs}
                                </p>
                            </div>
                        </article>
                    ))}
                </section>

                <button
                    onClick={handleReturnToRoom}
                    className="w-full border-b-4 border-r-4 border-[#E7C5B1] bg-[#85554C] px-6 py-4 font-black uppercase tracking-wider text-white transition hover:border-[#85554C] hover:bg-white hover:text-[#85554C] sm:w-auto"
                >
                    ← Return to Room
                </button>
            </div>
        </main>
    );
}

// Timeout or disconnection message
if (gameOverMessage) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#AD8971] px-4 py-8 text-white">
            <section className="w-full max-w-2xl space-y-6 border-4 border-[#85554C] bg-[#E7C5B1] p-8 text-center text-[#85554C] shadow-[-6px_6px_0_#85554C]">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                    Race Status
                </p>
                <h1 className="text-3xl font-black sm:text-4xl">
                    {gameOverMessage}
                </h1>

                <button
                    onClick={handleReturnToRoom}
                    className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-6 py-4 font-black text-white transition hover:bg-white hover:text-[#85554C] sm:w-auto"
                >
                    ← Return to Room
                </button>
            </section>
        </main>
    );
}

// This player's local finish screen while waiting for opponent
if (finalTime !== null) {
    return (
        <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <header className="border-4 border-[#E7C5B1] bg-[#E7C5B1] p-6 text-center shadow-[-8px_0px_#85554C] sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                        Race Status
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                        You Finished!
                    </h1>
                </header>

                <section className="space-y-5 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                    <div className="border-2 border-[#85554C] bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                            Your Time
                        </p>
                        <p className="mt-2 text-3xl font-black">
                            {(finalTime / 1000).toFixed(2)}s
                        </p>
                    </div>

                    <div className="border-2 border-[#85554C] bg-white p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                            Wrong Inputs
                        </p>
                        <p className="mt-2 text-2xl font-black">
                            {wrongInputs}
                        </p>
                    </div>

                    <p className="border-l-4 border-[#85554C] bg-white p-4 font-bold">
                        Waiting for your opponent to finish...
                    </p>
                </section>
            </div>
        </main>
    );
}

return (
    <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">

            {/* Page Header */}
            <header className="relative overflow-hidden border-4 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#85554C] sm:p-8">
                <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#AD8971] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#85554C]" />

                <div className="relative z-10 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                        Multiplayer
                    </p>
                    <h1 className="text-3xl font-black text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                        {gameStarted ? "Race Mode" : "Waiting Lobby"}
                    </h1>
                    <p className="text-sm font-semibold leading-6 text-[#AD8971] sm:text-base">
                        {gameStarted
                            ? "React quickly and complete all 50 prompts to finish the race."
                            : "Get ready, check the players, and prepare for the race."}
                    </p>

                </div>
            </header>

            {/* Waiting Lobby */}
            {!gameStarted && (
                <>
                    <section className="space-y-5 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h2 className="text-2xl font-black">
                                Players
                            </h2>
                            <span className="w-fit border-2 border-[#85554C] bg-white px-4 py-2 text-sm font-black">
                                {players.length} player{players.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {players.map((player) => {
                                const playerReady = readyPlayers.includes(
                                    player._id.toString()
                                );

                                return (
                                    <div
                                        key={player._id}
                                        className="flex items-center justify-between gap-3 border-2 border-[#85554C] bg-white p-4"
                                    >
                                        <span className="break-words font-black">
                                            {player.username}
                                        </span>

                                        <span
                                            className={`shrink-0 border-2 px-3 py-1 text-xs font-black uppercase ${
        playerReady
            ? "border-green-800 bg-green-100 text-green-800"
            : "border-[#AD8971] bg-[#E7C5B1] text-[#85554C]"
    }`}
                                        >
                                            {playerReady ? "Ready" : "Not Ready"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Input Display */}
                    {controllerConnected && (
                        <section className="space-y-4 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                            <h2 className="text-xl font-black">
                                Input Display
                            </h2>

                            <div className="space-y-2">
                                <label
                                    htmlFor="input-display"
                                    className="block text-sm font-bold uppercase tracking-wider"
                                >
                                    Prompt Style
                                </label>

                                <select
                                    id="input-display"
                                    value={displayMode}
                                    onChange={(event) => setDisplayMode(event.target.value)}
                                    className="w-full border-2 border-[#85554C] bg-white px-4 py-3 font-semibold text-[#85554C] outline-none focus:ring-2 focus:ring-[#85554C]/30"
                                >
                                    <option value="keyboard">Keyboard</option>
                                    <option value="xbox">Xbox Controller</option>
                                    <option value="dualshock">DualShock 4</option>
                                </select>
                            </div>
                        </section>
                    )}

                    {/* Difficulty Settings */}
                    <section className="space-y-4 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                        <h2 className="text-xl font-black">
                            Race Settings
                        </h2>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="font-bold">
                                Difficulty: {difficulty?.toUpperCase()}
                            </p>

                            {isHost && (
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        disabled={difficulty === "normal"}
                                        onClick={() => {
                                            socket.emit("changeDifficulty", {
                                                difficulty: "normal"
                                            });
                                        }}
                                        className="border-b-4 border-r-4 border-[#85554C] bg-white px-4 py-3 text-sm font-black transition hover:bg-[#85554C] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Normal (1 second)
                                    </button>

                                    <button
                                        disabled={difficulty === "hard"}
                                        onClick={() => {
                                            socket.emit("changeDifficulty", {
                                                difficulty: "hard"
                                            });
                                        }}
                                        className="border-b-4 border-r-4 border-[#85554C] bg-white px-4 py-3 text-sm font-black transition hover:bg-[#85554C] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Hard (0.5 seconds)
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Lobby Actions */}
                    <section className="space-y-4 border-4 border-[#85554C] bg-[#E7C5B1] p-6 shadow-[-6px_6px_0_#85554C] sm:p-8">
                        <button
                            onClick={() => {
                                socket.emit("toggleReady", {
                                    ready: !isReady
                                });
                            }}
                            className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-6 py-4 font-black uppercase tracking-wider text-white transition hover:bg-white hover:text-[#85554C]"
                        >
                            {isReady ? "Not Ready" : "Ready"}
                        </button>

                        <button
                            onClick={() => {
                                setError("");
                                socket.emit("startGame");
                            }}
                            disabled={!everyoneReady}
                            className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-6 py-4 font-black uppercase tracking-wider text-white transition hover:bg-white hover:text-[#85554C] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {players.length < 2
                                ? "Waiting for players..."
                                : everyoneReady
                                    ? "Start Game"
                                    : "Waiting for everyone to be ready"}
                        </button>

                        <Link
                            to="/home"
                            className="block border-2 border-[#85554C] bg-white px-6 py-3 text-center font-black text-[#85554C] transition hover:bg-[#85554C] hover:text-white"
                        >
                            Exit Room
                        </Link>
                    </section>
                </>
            )}

            {/* Active Race */}
            {gameStarted && (
                <>
                    <section className="space-y-6 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#AD8971]">
                                Race Progress
                            </p>
                            <span className="w-fit border-2 border-[#85554C] bg-white px-4 py-2 font-black">
                                Prompt {currentPromptIndex + 1} / 50
                            </span>
                        </div>

                        <div className="flex min-h-56 items-center justify-center border-4 border-[#85554C] bg-[#85554C] p-8 text-center shadow-[inset_0_0_0_4px_#AD8971]">
                            {currentPrompt && (
                                <h2 className="break-words text-5xl font-black text-white drop-shadow-[0_4px_0_#AD8971] sm:text-7xl">
                                    {getPromptDisplay(currentPrompt.key, displayMode)}
                                </h2>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="border-2 border-[#85554C] bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                                    Time
                                </p>
                                <p className="mt-2 text-2xl font-black">
                                    {((raceTime + penaltyTime) / 1000).toFixed(2)}s
                                </p>
                            </div>

                            <div className="border-2 border-[#85554C] bg-white p-5">
                                <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                                    Wrong Inputs
                                </p>
                                <p className="mt-2 text-2xl font-black">
                                    {wrongInputs}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="border-4 border-[#85554C] bg-[#E7C5B1] p-5 shadow-[-5px_5px_0_#85554C]">
                        <button
                            onClick={() => {
                                const confirmed = window.confirm(
                                    "Are you sure you want to forfeit this race?"
                                );

                                if (confirmed) {
                                    socket.emit("forfeitGame");
                                }
                            }}
                            className="w-full border-b-4 border-r-4 border-red-800 bg-red-700 px-6 py-4 font-black uppercase tracking-wider text-white transition hover:bg-red-900"
                        >
                            Forfeit Race
                        </button>
                    </section>
                </>
            )}
        </div>
    </main>
);
};

export default Game;
