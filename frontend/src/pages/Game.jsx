import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Game = () => {
    const { user } = useAuth();

    const [prompts, setPrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    const [racePrompts, setRacePrompts] = useState([]);

    const [raceTime, setRaceTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [penaltyTime, setPenaltyTime] = useState(0);

    const [gameStarted, setGameStarted] = useState(false);
    const [wrongInputs, setWrongInputs] = useState(0);

    const [finishTime, setFinishTime] = useState(null);
    const [finalTime, setFinalTime] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch QTE prompts
    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const response = await api.get("/qte-prompts");

                setPrompts(response.data);

                const generatedPrompts = Array.from(
                    { length: 50 },
                    () => {
                        const randomIndex = Math.floor(
                            Math.random() * response.data.length
                        );

                        return response.data[randomIndex];
                    }
                );

                setRacePrompts(generatedPrompts);

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

            // Don't accept input after the race has finished
            if (!currentPrompt || finishTime !== null) {
                return;
            }

            let pressedKey;

            if (event.code === "Space") {
                pressedKey = "SPACE";
                event.preventDefault();
            } else {
                pressedKey = event.key.toUpperCase();
            }

            // Correct input
            if (pressedKey === currentPrompt.key) {

                // Last prompt
                if (currentPromptIndex === 49) {
                    const finishedAt = Date.now();

                    setFinishTime(finishedAt);
                    setGameStarted(false);

                    return;
                }

                // Normal prompt
                setCurrentPromptIndex((previousIndex) => {
                    return previousIndex + 1;
                });

            } else {

                // Wrong input
                setWrongInputs((previousWrongInputs) => {
                    return previousWrongInputs + 1;
                });

                // +2 seconds penalty
                setPenaltyTime((previousPenalty) => {
                    return previousPenalty + 2000;
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };

    }, [currentPrompt, currentPromptIndex, finishTime]);

    // Start game
    useEffect(() => {
        if (racePrompts.length === 0) {
            return;
        }

        setGameStarted(true);
        setStartTime(Date.now());

    }, [racePrompts]);

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

    if (loading) {
        return <h1>Loading prompts...</h1>;
    }

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
                Time: {((raceTime + penaltyTime) / 1000).toFixed(2)}s
            </p>

            <p>
                Wrong Inputs: {wrongInputs}
            </p>
        </div>
    );
};

export default Game;