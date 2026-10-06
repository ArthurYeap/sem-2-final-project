import { useEffect, useState } from "react";
import api from "../api/axios";

const Game = () => {
    const [prompts, setPrompts] = useState([]);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    const currentPrompt = prompts[currentPromptIndex];

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!currentPrompt) {
                return;
            }

            let pressedKey;

            if (event.code === "Space") {
                pressedKey = "SPACE";
                event.preventDefault();
            } else {
                pressedKey = event.key.toUpperCase();
            }

            if (pressedKey === currentPrompt.key) {
                setCurrentPromptIndex((previousIndex) => {
                    return previousIndex + 1;
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentPrompt]);

    if (loading) {
        return <h1>Loading prompts...</h1>;
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    if (!currentPrompt) {
        return <h1>Race finished!</h1>;
    }

    return (
        <div>
            <h1>Race Mode</h1>

            <h2>
                Prompt {currentPromptIndex + 1} / 50
            </h2>

            <h1>
                Press: {currentPrompt.key}
            </h1>
        </div>
    );
};

export default Game;