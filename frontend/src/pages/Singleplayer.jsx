import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import useGamepad from "../hooks/useGamepad";

const TOTAL_PROMPTS = 50;
const TIME_LIMIT = 180000;

const Singleplayer = () => {
    const { user } = useAuth();

    const [prompts, setPrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [wrongInputs, setWrongInputs] = useState(0);
    const [penaltyTime, setPenaltyTime] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [timedOut, setTimedOut] = useState(false);
    const [saving, setSaving] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);

    const startTimeRef = useRef(null);
    const penaltyRef = useRef(0);
    const wrongInputsRef = useRef(0);
    const indexRef = useRef(0);
    const finishedRef = useRef(false);
    const promptsRef = useRef([]);

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
                finalTime,
                wrongInputs: wrongInputsRef.current,
                timedOut: wasTimedOut
            });

            setResult({
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

    const startGame = () => {
        if (prompts.length === 0 || !user) return;

        if (prompts.length === 0) {
            setError("No QTE prompts available.");
            return;
        }

        const selectedPrompts = Array.from(
            { length: TOTAL_PROMPTS },
            () => {
                const randomIndex = Math.floor(
                    Math.random() * prompts.length
                );

                return prompts[randomIndex];
            }
        );

        promptsRef.current = selectedPrompts;
        startTimeRef.current = Date.now();

        indexRef.current = 0;
        penaltyRef.current = 0;
        wrongInputsRef.current = 0;
        finishedRef.current = false;

        setPrompts([...prompts]);
        setCurrentPromptIndex(0);
        setWrongInputs(0);
        setPenaltyTime(0);
        setElapsedTime(0);
        setTimedOut(false);
        setResult(null);
        setError("");
        setGameOver(false);
        setGameStarted(true);
    };

    const handleGameInput = (pressedKey) => {
        if (!gameStarted || finishedRef.current) return;

        const currentPrompt = promptsRef.current[indexRef.current];

        if (!currentPrompt) return;

        if (pressedKey === currentPrompt.key.toUpperCase()) {
            const nextIndex = indexRef.current + 1;

            indexRef.current = nextIndex;
            setCurrentPromptIndex(nextIndex);

            if (nextIndex >= TOTAL_PROMPTS) {
                saveResult(false);
            }
        } else {
            penaltyRef.current += 2000;
            wrongInputsRef.current += 1;

            setPenaltyTime(penaltyRef.current);
            setWrongInputs(wrongInputsRef.current);
        }
    };

    useGamepad(handleGameInput, gameStarted);

    const { connected: controllerConnected } = useGamepad(
        handleGameInput,
        gameStarted
    );
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

    useEffect(() => {
        if (!gameStarted) return;

        const handleKeyDown = (event) => {
            if (event.repeat || finishedRef.current) return;

            let pressedKey = event.key.toUpperCase();

            if (event.code === "Space") {
                event.preventDefault();
                pressedKey = "SPACE";
            }

            handleGameInput(pressedKey);
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameStarted]);

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
        return <p>Loading QTE prompts...</p>;
    }

    return (
        <div>
            <h1>Single Player</h1>
            <p>
                Controller: {controllerConnected ? "Connected" : "Not detected"}
            </p>

            {error && <p>{error}</p>}

            {!gameStarted && !gameOver && (
                <button onClick={startGame}>
                    Start Game
                </button>
            )}

            {gameStarted && (
                <div>
                    <h2>
                        Prompt {currentPromptIndex + 1} / {TOTAL_PROMPTS}
                    </h2>

                    <h1>
                        {promptsRef.current[currentPromptIndex]?.key}
                    </h1>

                    <p>
                        Time: {formatTime(elapsedTime)}
                    </p>

                    <p>
                        Wrong Inputs: {wrongInputs}
                    </p>

                    <p>
                        Penalty: {formatTime(penaltyTime)}
                    </p>
                </div>
            )}

            {gameOver && (
                <div>
                    <h2>
                        {timedOut ? "Time's Up!" : "Game Completed!"}
                    </h2>

                    {saving && <p>Saving your result...</p>}

                    {result && (
                        <>
                            <p>
                                Final Time: {formatTime(result.finalTime)}
                            </p>

                            <p>
                                Wrong Inputs: {result.wrongInputs}
                            </p>

                            <button onClick={startGame}>
                                Play Again
                            </button>
                        </>
                    )}

                    {!saving && !result && (
                        <button onClick={startGame}>
                            Try Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Singleplayer;
