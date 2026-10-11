const getPromptDisplay = (promptKey, displayMode) => {
    const key = promptKey.toUpperCase();

    // Keyboard is always the default display.
    if (displayMode === "keyboard") {
        if (key === "SPACE") return "SPACE";
        if (key === "UP") return "↑";
        if (key === "DOWN") return "↓";
        if (key === "LEFT") return "←";
        if (key === "RIGHT") return "→";
        return key;
    }

    // Left analog stick directions.
    const stickDirections = {
        W: "↑",
        A: "←",
        S: "↓",
        D: "→"
    };

    if (stickDirections[key]) {
        return stickDirections[key];
    }

    const xboxLabels = {
        A: "A",
        E: "B",
        Q: "X",
        F: "Y",
        SPACE: "A",
        UP: "LT",
        DOWN: "RB",
        RIGHT: "RT",
        LEFT: "LB"
    };

    const dualShockLabels = {
        A: "×",
        E: "○",
        Q: "□",
        F: "△",
        SPACE: "×",
        UP: "L2",
        DOWN: "R1",
        RIGHT: "R2",
        LEFT: "L1"
    };

    if (displayMode === "xbox") {
        return xboxLabels[key] ?? key;
    }

    if (displayMode === "dualshock") {
        return dualShockLabels[key] ?? key;
    }

    return key;
};

export default getPromptDisplay;
