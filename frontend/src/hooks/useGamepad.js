
import { useEffect, useRef, useState } from "react";

const BUTTON_KEY_MAP = {
    0: "R",      // Xbox A / PlayStation Cross
    1: "E",      // Xbox B / PlayStation Circle
    2: "Q",      // Xbox X / PlayStation Square
    3: "F",      // Xbox Y / PlayStation Triangle

    7: "SPACE",  // RT / R2

    12: "W",     // D-pad up
    13: "S",     // D-pad down
    14: "A",     // D-pad left
    15: "D"      // D-pad right
};

const useGamepad = (onInput, enabled = true) => {
    const [connected, setConnected] = useState(false);

    const onInputRef = useRef(onInput);
    const previousButtonsRef = useRef({});

    useEffect(() => {
        onInputRef.current = onInput;
    }, [onInput]);

    useEffect(() => {
        if (!enabled) return;

        let animationId;

        const pollGamepads = () => {
            if (!navigator.getGamepads) {
                setConnected(false);
                return;
            }

            const gamepads = Array.from(navigator.getGamepads());
            const isConnected = gamepads.some(
                (gamepad) => gamepad !== null
            );

            setConnected((previous) =>
                previous === isConnected ? previous : isConnected
            );

            const activeIndexes = new Set();

            gamepads.forEach((gamepad, gamepadIndex) => {
                if (!gamepad) return;

                activeIndexes.add(gamepadIndex);

                if (!previousButtonsRef.current[gamepadIndex]) {
                    previousButtonsRef.current[gamepadIndex] = {};
                }

                const previousButtons =
                    previousButtonsRef.current[gamepadIndex];

                gamepad.buttons.forEach((button, buttonIndex) => {
                    const isPressed = button.pressed;
                    const wasPressed = previousButtons[buttonIndex] || false;

                    // Only trigger once when a button is newly pressed.
                    if (isPressed && !wasPressed) {
                        const key = BUTTON_KEY_MAP[buttonIndex];

                        if (key) {
                            onInputRef.current(key);
                        }
                    }

                    previousButtons[buttonIndex] = isPressed;
                });
            });

            // Remove disconnected controllers' button states.
            Object.keys(previousButtonsRef.current).forEach((index) => {
                if (!activeIndexes.has(Number(index))) {
                    delete previousButtonsRef.current[index];
                }
            });

            animationId = requestAnimationFrame(pollGamepads);
        };

        animationId = requestAnimationFrame(pollGamepads);

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [enabled]);

    return { connected };
};

export default useGamepad;
