// ? custom hook to handle gamepad input and map it to keyboard keys for a React application.
import { useEffect, useRef, useState } from "react";

const BUTTON_KEY_MAP = {
    6: "UP",     // LT / L2
    5: "DOWN",   // RB / R1
    7: "RIGHT",  // RT / R2
    4: "LEFT",   // LB / L1

    1: "E",      // Xbox B / PlayStation Circle
    2: "Q",      // Xbox X / PlayStation Square
    3: "F",      // Xbox Y / PlayStation Triangle

    0: "SPACE"   // Xbox A / PlayStation Cross
};

const useGamepad = (onInput, enabled = true) => {
    const [connected, setConnected] = useState(false);

    const onInputRef = useRef(onInput);
    const enabledRef = useRef(enabled);
    const previousButtonsRef = useRef({});
    const previousDirectionsRef = useRef({});

    // ? Always use the latest callback and enabled state.
    useEffect(() => {
        onInputRef.current = onInput;
        enabledRef.current = enabled;
    }, [onInput, enabled]);

    // ? Poll the gamepad state using requestAnimationFrame.
    useEffect(() => {
        let animationId;

        // ? Function to poll the gamepad state and handle input.
        const pollGamepads = () => {
            // * Check if the browser supports the Gamepad API.
            if (!navigator.getGamepads) {
                setConnected(false);
                return;
            }

            // ? Get the list of connected gamepads.
            const gamepads = Array.from(navigator.getGamepads());

            // ! Create a set to track active gamepad indexes aka how many controllers
            const activeIndexes = new Set();

            // * update connection status
            const isConnected = gamepads.some(
                (gamepad) => gamepad !== null && gamepad.connected
            );

            setConnected((previous) =>
                previous === isConnected ? previous : isConnected
            );
            // *=============================================


            gamepads.forEach((gamepad, gamepadIndex) => {
                if (!gamepad || !gamepad.connected) return;

                // ! Add the index/available controller to activeIndexes set.
                activeIndexes.add(gamepadIndex);

                // ? Initialize previous button states for this gamepad
                if (!previousButtonsRef.current[gamepadIndex]) {
                    previousButtonsRef.current[gamepadIndex] = {};
                }

                const previousButtons =
                    previousButtonsRef.current[gamepadIndex];
                // ?=============================================

                // * Detect button presses
                gamepad.buttons.forEach((button, buttonIndex) => {
                    // ? button is pressed?
                    const isPressed = button.pressed;
                    // ! was the button pressed in the previous frame?
                    const wasPressed =
                        previousButtons[buttonIndex] || false;

                    // * if the button is pressed now, but wasn't pressed before, and the input is enabled, send the corresponding key to the onInput callback.
                    if (
                        isPressed &&
                        !wasPressed &&
                        enabledRef.current
                    ) {
                        const key = BUTTON_KEY_MAP[buttonIndex];

                        if (key) {
                            onInputRef.current(key);
                        }
                    }

                    // ! Update the previous button state for this button index.
                    previousButtons[buttonIndex] = isPressed;
                });

                // * Left analog joystick: axes 0 and 1.
                const x = gamepad.axes[0] ?? 0;
                const y = gamepad.axes[1] ?? 0;

                // * Dead zone threshold to prevent accidental input from slight joystick movements.
                const deadZone = 0.6;
                let direction = null;

                // ! will trigger the left stick input if the stick is moved beyond the dead zone threshold.
                if (Math.abs(x) >= deadZone || Math.abs(y) >= deadZone) {
                    if (Math.abs(x) > Math.abs(y)) {
                        direction = x < 0 ? "A" : "D";
                    } else {
                        direction = y < 0 ? "W" : "S";
                    }
                }

                // ? Get the previous direction for this gamepad.
                const previousDirection =
                    previousDirectionsRef.current[gamepadIndex] ?? null;

                // ! avoid sending the same direction repeatedly if the stick is held in one direction.
                if (direction && direction !== previousDirection && enabledRef.current) {
                    onInputRef.current(direction);
                }

                previousDirectionsRef.current[gamepadIndex] = direction;
            });

            // * cleanup disconnectedd controllers
            Object.keys(previousButtonsRef.current).forEach((index) => {
                if (!activeIndexes.has(Number(index))) {
                    delete previousButtonsRef.current[index];
                    delete previousDirectionsRef.current[index];
                }
            });

            // ! schedule the next polling cycle
            animationId = requestAnimationFrame(pollGamepads);
        };

        animationId = requestAnimationFrame(pollGamepads);

        return () => cancelAnimationFrame(animationId);
    }, []);

    return { connected };
};

export default useGamepad;
