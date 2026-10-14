import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {Link} from "react-router-dom";
import getPromptDisplay from "../utils/getPromptDisplay";
import useGamepad from "../hooks/useGamepad";


const TOTAL_PROMPTS = 50;
const TIME_LIMIT = 120000;

const PROMPT_DURATIONS = {
    normal: 1000,
    hard: 500,
};


const Singleplayer = () => {
    const { user } = useAuth();

    const [prompts, setPrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [wrongInputs, setWrongInputs] = useState(0);
    const [penaltyTime, setPenaltyTime] = useState(0);
    const [displayMode, setDisplayMode] = useState("keyboard");
    const [elapsedTime, setElapsedTime] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [saving, setSaving] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);const [difficulty, setDifficulty] = useState("normal");
    const [promptTimeLeft, setPromptTimeLeft] = useState(1000);

    const promptStartTimeRef = useRef(null);
    const promptTimeoutRef = useRef(null);
    const startTimeRef = useRef(null);
    const promptHandledRef = useRef(false);
    const penaltyRef = useRef(0);
    const wrongInputsRef = useRef(0);
    const indexRef = useRef(0);
    const finishedRef = useRef(false);
    const promptsRef = useRef([]);

    // ! Fetch QTE prompts from the backend when the component mounts.
    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const response = await api.get("/qte-prompts");
                setPrompts(response.data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load QTE prompts."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPrompts();
    }, []);

    // ! Save the game result to the backend.
    const saveResult = async (wasTimedOut) => {
        if (finishedRef.current) return;

        finishedRef.current = true;

        const finishTime = Date.now();
        const actualTime = Math.min(
            finishTime - startTimeRef.current,
            TIME_LIMIT
        );

        const finalTime = actualTime + penaltyRef.current;

        setGameStarted(false);
        setGameOver(true);
        setTimedOut(wasTimedOut);
        setElapsedTime(actualTime);
        setSaving(true);

        try {

            await api.post("/games", {
                userId: user._id,
                mode: "singleplayer",
                difficulty,
                finalTime,
                wrongInputs: wrongInputsRef.current,
                timedOut: wasTimedOut
            });

            // * Update the result state to display the final results to the user.
            setResult({
                difficulty,
                finalTime,
                wrongInputs: wrongInputsRef.current,
                timedOut: wasTimedOut
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Your result could not be saved."
            );
        } finally {
            setSaving(false);
        }
    };

    // ! Start the game.
    const startGame = () => {
        if (prompts.length === 0 || !user) return;

        // ? Randomly select 50 prompts.
        const selectedPrompts = Array.from(
            { length: TOTAL_PROMPTS },
            () => {
                const randomIndex = Math.floor(
                    Math.random() * prompts.length
                );

                return prompts[randomIndex];
            }
        );

        // * Reset timers and refs.
        startTimeRef.current = Date.now();
        promptStartTimeRef.current = Date.now();

        indexRef.current = 0;
        penaltyRef.current = 0;
        wrongInputsRef.current = 0;
        finishedRef.current = false;
        promptHandledRef.current = false;
        promptsRef.current = selectedPrompts;

        //? Reset displayed state.
        setCurrentPromptIndex(0);
        setWrongInputs(0);
        setPenaltyTime(0);
        setElapsedTime(0);
        setPromptTimeLeft(PROMPT_DURATIONS[difficulty]);
        setTimedOut(false);
        setResult(null);
        setError("");
        setGameOver(false);

        setGameStarted(true);
    };

    // ! Return to the preparation screen.
    const backToPreparation = () => {
        // * Stop the current game and reset everything.
        setGameStarted(false);
        clearTimeout(promptTimeoutRef.current);

        finishedRef.current = true;
        promptHandledRef.current = false;
        indexRef.current = 0;
        penaltyRef.current = 0;
        wrongInputsRef.current = 0;

        setCurrentPromptIndex(0);
        setWrongInputs(0);
        setPenaltyTime(0);
        setElapsedTime(0);
        setPromptTimeLeft(PROMPT_DURATIONS[difficulty]);

        setGameOver(false);
        setTimedOut(false);
        setResult(null);
        setError("");
    };




    // * Handle the penalty when a prompt times out.
    const handlePromptTimeout = () => {
        if (finishedRef.current || promptHandledRef.current) return;

        promptHandledRef.current = true;

        penaltyRef.current += 1000;
        setPenaltyTime(penaltyRef.current);

        const nextIndex = indexRef.current + 1;

        // ? If the next index exceeds the total prompts, save the result and set timeout to false and end the game.
        if (nextIndex >= TOTAL_PROMPTS) {
            indexRef.current = nextIndex;
            saveResult(false);
            return;
        }

        indexRef.current = nextIndex;
        promptStartTimeRef.current = Date.now();

        setCurrentPromptIndex(nextIndex);
        setPromptTimeLeft(PROMPT_DURATIONS[difficulty]);

        promptHandledRef.current = false;
    };

    // ! Handle the game input from either keyboard or gamepad.
    const handleGameInput = (pressedKey) => {
        if (
            !gameStarted ||
            finishedRef.current ||
            promptHandledRef.current
        ) {
            return;
        }

        const currentPrompt = promptsRef.current[indexRef.current];

        if (!currentPrompt) return;

        if (pressedKey === currentPrompt.key.toUpperCase()) {
            promptHandledRef.current = true;

            const nextIndex = indexRef.current + 1;

            if (nextIndex >= TOTAL_PROMPTS) {
                indexRef.current = nextIndex;
                saveResult(false);
                return;
            }

            indexRef.current = nextIndex;
            promptStartTimeRef.current = Date.now();

            setCurrentPromptIndex(nextIndex);
            setPromptTimeLeft(PROMPT_DURATIONS[difficulty]);

            promptHandledRef.current = false;
        } else {
            //! Incorrect input: +1 wrong input and +1 second.
            wrongInputsRef.current += 1;
            penaltyRef.current += 1000;

            setWrongInputs(wrongInputsRef.current);
            setPenaltyTime(penaltyRef.current);
        }
    };

    // ? check if a gamepad is connected and handle its input.
    const { connected: controllerConnected } = useGamepad(
        handleGameInput,
        gameStarted
    );

    // ! set the display mode to keyboard if no controller is connected.
    useEffect(() => {
        if (!controllerConnected && displayMode !== "keyboard") {
            setDisplayMode("keyboard");

        }
    }, [controllerConnected, displayMode]);

    // ! Start the game timer.
    useEffect(() => {
        if (!gameStarted) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;

            setElapsedTime(Math.min(elapsed, TIME_LIMIT));

            if (elapsed >= TIME_LIMIT) {
                saveResult(true);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [gameStarted]);

    // ! Handle special key input.
    useEffect(() => {
        if (!gameStarted) return;

        const handleKeyDown = (event) => {
            if (event.repeat || finishedRef.current) return;

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

            handleGameInput(pressedKey);
        };

        // ! trigger the handleKeyDown function when a key is pressed down.
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameStarted]);

    // * Format the time in mm:ss:cs format.
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

    // ! handles prompt timeout and update the prompt time left.
    useEffect(() => {
        if (!gameStarted) return;

        const duration = PROMPT_DURATIONS[difficulty];

        const interval = setInterval(() => {
            if (finishedRef.current || promptHandledRef.current) {
                return;
            }

            const elapsed = Date.now() - promptStartTimeRef.current;
            const remaining = Math.max(0, duration - elapsed);

            setPromptTimeLeft(remaining);

            if (remaining <= 0) {
                handlePromptTimeout();
            }
        }, 25);

        return () => clearInterval(interval);
    }, [gameStarted, currentPromptIndex, difficulty]);



if (loading) {
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#AD8971] px-4 text-white">
            <div className="border-4 border-[#85554C] bg-[#E7C5B1] px-8 py-6 text-center shadow-[-6px_6px_0_#85554C]">
                <p className="text-lg font-black text-[#85554C]">
                    Loading QTE prompts...
                </p>
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
                        Singleplayer
                    </p>

                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                        Single Player
                    </h1>

                    <p className="text-sm font-semibold leading-6 text-[#AD8971] sm:text-base">
                        Test your reaction speed and complete every prompt before time runs out.
                    </p>
                </div>
            </header>

            {/* Controller Status */}
            <section className="flex flex-col gap-3 border-4 border-[#85554C] bg-[#E7C5B1] p-5 text-[#85554C] shadow-[-5px_5px_0_#85554C] sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-black">
                    Controller Status
                </h2>

                <span
                    className={`w-fit border-2 px-4 py-2 text-sm font-black ${
        controllerConnected
            ? "border-green-800 bg-green-100 text-green-800"
            : "border-[#85554C] bg-white text-[#85554C]"
    }`}
                >
                    {controllerConnected ? "● Connected" : "○ Not detected"}
                </span>
            </section>

            {/* Game Preparation */}
            {!gameStarted && !gameOver && (
                <section className="space-y-6 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black">
                            Game Preparation
                        </h2>
                        <p className="text-sm font-medium leading-6 text-[#85554C]/80">
                            Configure your difficulty and get ready to play.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="difficulty"
                            className="block text-sm font-bold uppercase tracking-wider"
                        >
                            Difficulty
                        </label>

                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(event) => setDifficulty(event.target.value)}
                            className="w-full border-2 border-[#85554C] bg-white px-4 py-3 font-semibold text-[#85554C] outline-none focus:ring-2 focus:ring-[#85554C]/30"
                        >
                            <option value="normal">
                                Normal (1 second per prompt)
                            </option>
                            <option value="hard">
                                Hard (0.5 seconds per prompt)
                            </option>
                        </select>
                    </div>

                    {controllerConnected && (
                        <div className="space-y-2">
                            <label
                                htmlFor="input-display"
                                className="block text-sm font-bold uppercase tracking-wider"
                            >
                                Input Display
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
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="border-l-4 border-red-600 bg-red-100 p-3 font-semibold text-red-700"
                        >
                            {error}
                        </p>
                    )}

                    <button
                        onClick={startGame}
                        className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-6 py-4 font-black uppercase tracking-wider text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] focus:outline-none focus:ring-2 focus:ring-[#85554C] focus:ring-offset-2 focus:ring-offset-[#E7C5B1]"
                    >
                        Start Game →
                    </button>
                </section>
            )}

            {/* Active Game */}
            {gameStarted && (
                <section className="space-y-6 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-bold uppercase tracking-wider text-[#AD8971]">
                            Current Progress
                        </p>

                        <span className="w-fit border-2 border-[#85554C] bg-white px-4 py-2 font-black">
                            Prompt {currentPromptIndex + 1} / {TOTAL_PROMPTS}
                        </span>
                    </div>

                    <div className="flex min-h-52 items-center justify-center border-4 border-[#85554C] bg-[#85554C] p-8 text-center shadow-[inset_0_0_0_4px_#AD8971]">
                        <h2 className="break-words text-5xl font-black text-white drop-shadow-[0_4px_0_#AD8971] sm:text-7xl">
                            {promptsRef.current[currentPromptIndex]
                                ? getPromptDisplay(
                                    promptsRef.current[currentPromptIndex].key,
                                    displayMode
                                )
                                : "Loading prompt..."}
                        </h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="border-2 border-[#85554C] bg-white p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                                Time
                            </p>
                            <p className="mt-2 text-2xl font-black text-[#85554C]">
                                {formatTime(elapsedTime + penaltyTime)}
                            </p>
                        </div>

                        <div className="border-2 border-[#85554C] bg-white p-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                                Wrong Inputs
                            </p>
                            <p className="mt-2 text-2xl font-black text-[#85554C]">
                                {wrongInputs}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* Game Results */}
            {gameOver && (
                <section className="space-y-6 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                    <div className="space-y-2 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                            Game Results
                        </p>

                        <h2 className="text-3xl font-black sm:text-4xl">
                            {timedOut ? "Time's Up!" : "Game Completed!"}
                        </h2>
                    </div>

                    {saving && (
                        <p className="border-2 border-[#85554C] bg-white p-4 text-center font-bold">
                            Saving your result...
                        </p>
                    )}

                    {result && (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="border-2 border-[#85554C] bg-white p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                                        Final Time
                                    </p>
                                    <p className="mt-2 text-2xl font-black">
                                        {formatTime(result.finalTime)}
                                    </p>
                                </div>

                                <div className="border-2 border-[#85554C] bg-white p-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#AD8971]">
                                        Wrong Inputs
                                    </p>
                                    <p className="mt-2 text-2xl font-black">
                                        {result.wrongInputs}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={startGame}
                                className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-6 py-4 font-black uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#85554C]"
                            >
                                Play Again →
                            </button>
                        </>
                    )}

                    {!saving && !result && (
                        <button
                            onClick={startGame}
                            className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-6 py-4 font-black uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#85554C]"
                        >
                            Try Again →
                        </button>
                    )}
                </section>
            )}

            {/* Navigation */}
            <div className="flex flex-col gap-4 sm:flex-row">
                {(gameStarted || gameOver) && (
                    <button
                        onClick={backToPreparation}
                        disabled={saving}
                        className="flex-1 border-b-4 border-r-4 border-[#85554C] bg-[#E7C5B1] px-5 py-3 font-black text-[#85554C] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        ← Back to Preparation
                    </button>
                )}

                <Link
                    to="/home"
                    className="flex flex-1 items-center justify-center border-b-4 border-r-4 border-[#E7C5B1] bg-[#85554C] px-5 py-3 text-center font-black text-white transition-all hover:border-[#85554C] hover:bg-white hover:text-[#85554C]"
                >
                    Quit Game
                </Link>
            </div>
        </div>
    </main>
);
};

export default Singleplayer;
