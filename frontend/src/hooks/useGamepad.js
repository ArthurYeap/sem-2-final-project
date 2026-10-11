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

    // Always use the latest callback and enabled state.
    useEffect(() => {
        onInputRef.current = onInput;
        enabledRef.current = enabled;
    }, [onInput, enabled]);

    useEffect(() => {
        let animationId;

        const pollGamepads = () => {
            if (!navigator.getGamepads) {
                setConnected(false);
                return;
            }

            const gamepads = Array.from(navigator.getGamepads());
            const activeIndexes = new Set();

            const isConnected = gamepads.some(
                (gamepad) => gamepad !== null && gamepad.connected
            );

            setConnected((previous) =>
                previous === isConnected ? previous : isConnected
            );

            gamepads.forEach((gamepad, gamepadIndex) => {
                if (!gamepad || !gamepad.connected) return;

                activeIndexes.add(gamepadIndex);

                if (!previousButtonsRef.current[gamepadIndex]) {
                    previousButtonsRef.current[gamepadIndex] = {};
                }

                const previousButtons =
                    previousButtonsRef.current[gamepadIndex];

                // Controller buttons and D-pad.
                gamepad.buttons.forEach((button, buttonIndex) => {
                    const isPressed = button.pressed;
                    const wasPressed =
                        previousButtons[buttonIndex] || false;

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

                    previousButtons[buttonIndex] = isPressed;
                });

                // Left analog joystick: axes 0 and 1.
                const x = gamepad.axes[0] ?? 0;
                const y = gamepad.axes[1] ?? 0;

                const deadZone = 0.6;
                let direction = null;

                if (Math.abs(x) >= deadZone || Math.abs(y) >= deadZone) {
                    if (Math.abs(x) > Math.abs(y)) {
                        direction = x < 0 ? "A" : "D";
                    } else {
                        direction = y < 0 ? "W" : "S";
                    }
                }

                const previousDirection =
                    previousDirectionsRef.current[gamepadIndex] ?? null;

                if (direction && direction !== previousDirection && enabledRef.current) {
                    onInputRef.current(direction);
                }

                previousDirectionsRef.current[gamepadIndex] = direction;
            });

            // Remove stale states for disconnected controllers.
            Object.keys(previousButtonsRef.current).forEach((index) => {
                if (!activeIndexes.has(Number(index))) {
                    delete previousButtonsRef.current[index];
                    delete previousDirectionsRef.current[index];
                }
            });

            animationId = requestAnimationFrame(pollGamepads);
        };

        animationId = requestAnimationFrame(pollGamepads);

        return () => cancelAnimationFrame(animationId);
    }, []);

    return { connected };
};

export default useGamepad;
