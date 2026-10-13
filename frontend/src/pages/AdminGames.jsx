
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminGames = () => {
    const [games, setGames] = useState([]);
    const [mode, setMode] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [finalTime, setFinalTime] = useState("");
    const [wrongInputs, setWrongInputs] = useState("");
    const [timedOut, setTimedOut] = useState(false);
    const [forfeited, setForfeited] = useState(false);
    const [saving, setSaving] = useState(false);

    const [difficulty, setDifficulty] = useState("all");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("newest");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalGames, setTotalGames] = useState(0);

    const PAGE_SIZE = 10;

    const fetchGames = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {
                page: currentPage,
                limit: PAGE_SIZE,
                sort
            };

            if (mode !== "all") {
                params.mode = mode;
            }

            if (difficulty !== "all") {
                params.difficulty = difficulty;
            }

            if (status !== "all") {
                params.status = status;
            }

            const response = await api.get("/games", { params });

            setGames(response.data.games);
            setTotalGames(response.data.totalGames);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load game records."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGames();
    }, [mode, difficulty, status, sort, currentPage]);

    const handleEdit = (game) => {
        setEditingId(game._id);
        setFinalTime(String(game.finalTime));
        setWrongInputs(String(game.wrongInputs));
        setTimedOut(Boolean(game.timedOut));
        setForfeited(Boolean(game.forfeited));
        setError("");
        setMessage("");
    };

    const handleCancel = () => {
        setEditingId(null);
        setFinalTime("");
        setWrongInputs("");
        setTimedOut(false);
        setForfeited(false);    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        const time = Number(finalTime);
        const mistakes = Number(wrongInputs);

        if (!finalTime.trim() || !Number.isFinite(time) || time < 0) {
            setError("Final time must be a valid non-negative number.");
            return;
        }

        if (
            !wrongInputs.trim() ||
            !Number.isInteger(mistakes) ||
            mistakes < 0
        ) {
            setError("Wrong inputs must be a non-negative whole number.");
            return;
        }

        try {
            setSaving(true);
            setError("");
            setMessage("");

            const response = await api.put(`/games/${editingId}`, {
                finalTime: time,
                wrongInputs: mistakes,
                timedOut,
                forfeited
            });

            const updatedGame = response.data.game;

            setGames((previousGames) =>
                previousGames.map((game) =>
                    game._id === editingId
                        ? { ...game, ...updatedGame }
                        : game
                )
            );

            setMessage("Game record updated successfully.");
            handleCancel();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update game record."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (gameId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this game record?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await api.delete(`/games/${gameId}`);

            setGames((previousGames) =>
                previousGames.filter((game) => game._id !== gameId)
            );

            if (editingId === gameId) {
                handleCancel();
            }

            setMessage("Game record deleted successfully.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete game record."
            );
        }
    };

    const formatTime = (milliseconds) => {
        const totalSeconds = milliseconds / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = (totalSeconds % 60).toFixed(2);

        return `${String(minutes).padStart(2, "0")}:${String(
            seconds
        ).padStart(5, "0")}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-[#AD8971] px-4">
                <div className="flex items-center gap-3 border-4 border-[#E7C5B1] bg-[#E7C5B1] px-6 py-5 text-white shadow-[-6px_0px_#85554C]">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-[#85554C]" />
                    <p className="text-sm font-bold drop-shadow-[0_2px_0_#85554C]">
                        Loading game records...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Page Header */}
                <header className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#85554C] sm:p-8">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#AD8971] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#85554C]" />

                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                                Administration
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                                Game Record Management
                            </h1>

                            <p className="max-w-2xl text-sm leading-6 font-semibold text-[#AD8971] sm:text-base">
                                View and manage game records from all players.
                            </p>
                        </div>

                        <Link
                            to="/admin"
                            className="inline-flex w-fit items-center gap-2 border-b-4 border-r-4 border-white rounded-br-[2em] bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C] focus:outline-none focus:ring-2 focus:ring-[#AD8971]"
                        >
                            <span aria-hidden="true">←</span>
                            Back to Dashboard
                        </Link>
                    </div>
                </header>

                {/* Filters */}
                <section className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#85554C] sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-xl font-black text-white drop-shadow-[0_2px_0_#85554C]">
                            Find Game Records
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#AD8971]">
                            Filter and sort records to find the games you need.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="space-y-2">
                            <label htmlFor="gameMode" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Game Mode
                            </label>
                            <select
                                id="gameMode"
                                value={mode}
                                onChange={(event) => {
                                    setMode(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:w-full hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="all">All Games</option>
                                <option value="singleplayer">Singleplayer</option>
                                <option value="multiplayer">Multiplayer</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="difficulty" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Difficulty
                            </label>
                            <select
                                id="difficulty"
                                value={difficulty}
                                onChange={(event) => {
                                    setDifficulty(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="all">All Difficulties</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Status
                            </label>
                            <select
                                id="status"
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="timedOut">Timed Out </option>
                                <option value="forfeited">Forfeited</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="gameSort" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Sort By
                            </label>
                            <select
                                id="gameSort"
                                value={sort}
                                onChange={(event) => {
                                    setSort(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="fastest">Fastest Final Time</option>
                                <option value="slowest">Slowest Final Time</option>
                                <option value="fewestMistakes">Fewest Wrong Inputs</option>
                                <option value="mostMistakes">Most Wrong Inputs</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t-4 border-[#AD8971]/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-[#AD8971]">
                            Use the filters above to narrow down the records.
                        </p>

                        <button
                            type="button"
                            onClick={() => {
                                setMode("all");
                                setDifficulty("all");
                                setStatus("all");
                                setCurrentPage(1);
                            }}
                            className="flex w-fit items-center justify-center rounded-br-[2em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C] active:bg-[#85554C] active:text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                </section>

                {/* Alerts */}
                {error && (
                    <div
                        role="alert"
                        className="border-4 border-[#85554C] bg-white px-5 py-4 text-sm font-bold text-[#AD8971] shadow-[-5px_0px_#E7C5B1]"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="border-4 border-[#E7C5B1] bg-[#85554C] px-5 py-4 text-sm font-bold text-white shadow-[-5px_0px_#AD8971]"
                    >
                        {message}
                    </div>
                )}

                {/* Game Records */}
                <section className="space-y-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white drop-shadow-[0_3px_0_#85554C]">
                                Game Records
                            </h2>
                            <p className="mt-1 text-sm font-semibold text-[#E7C5B1]">
                                {totalGames} matching records in total
                            </p>
                        </div>
                    </div>

                    {games.length === 0 ? (
                        <div className="border-5 border-dashed border-[#E7C5B1] bg-[#AD8971] px-6 py-14 text-center shadow-[-6px_0px_#85554C]">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-br-[1.5em] bg-[#85554C] text-2xl font-black text-white">
                                —
                            </div>
                            <h3 className="text-lg font-black text-white">
                                No game records found
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-[#E7C5B1]">
                                Try changing or clearing your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                            {games.map((game) => (
                                <article
                                    key={game._id}
                                    className="group relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] shadow-[-6px_0px_#85554C] transition-all duration-300 hover:-translate-y-1 hover:shadow-[-9px_5px_#85554C]"
                                >
                                    {/* Card Header */}
                                    <div className="relative flex flex-col gap-4 border-b-4 border-[#AD8971]/20 bg-[#E7C5B1] p-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#AD8971]">
                                                Player
                                            </p>
                                            <h3 className="mt-1 break-words text-xl font-black text-white drop-shadow-[0_2px_0_#85554C]">
                                                {game.userId?.username || "Unknown Player"}
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                        <span className="rounded-br-[1em] border-b-2 border-r-2 border-white bg-[#AD8971] px-3 py-2 text-xs font-bold capitalize text-[#E7C5B1]">
                                            {game.mode}
                                        </span>
                                            <span className={`rounded-br-[1em] border-b-2 border-r-2 border-white px-3 py-2 text-xs font-bold ${game.timedOut ? "bg-[#85554C] text-white" : "bg-[#AD8971] text-white"}`}>
                                                {game.forfeited ? "Forfeited" : game.timedOut ? "Timed Out" : "Completed"}
                                        </span>
                                        </div>
                                    </div>

                                    {/* Game Statistics */}
                                    <div className="grid grid-cols-1 gap-4 bg-[#E7C5B1] p-5 sm:grid-cols-2">
                                        <div className="border-b-4 border-r-4 border-[#85554C] rounded-br-[1.5em] bg-[#AD8971] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Difficulty
                                            </p>
                                            <p className="mt-2 font-black capitalize text-white">
                                                {game.difficulty || "Normal"}
                                            </p>
                                        </div>

                                        <div className="border-b-4 border-r-4 border-[#85554C] rounded-br-[1.5em] bg-[#AD8971] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Final Time
                                            </p>
                                            <p className="mt-2 font-black tabular-nums text-white">
                                                {formatTime(game.finalTime)}
                                            </p>
                                        </div>

                                        <div className="border-b-4 border-r-4 border-[#85554C] rounded-br-[1.5em] bg-[#AD8971] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Wrong Inputs
                                            </p>
                                            <p className="mt-2 font-black tabular-nums text-white">
                                                {game.wrongInputs}
                                            </p>
                                        </div>

                                        {game.mode === "multiplayer" && (
                                            <>
                                                <div className="border-b-4 border-r-4 border-[#85554C] rounded-br-[1.5em] bg-[#AD8971] p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                        Rank
                                                    </p>
                                                    <p className="mt-2 font-black text-white">
                                                        {game.rank ?? "Not recorded"}
                                                    </p>
                                                </div>

                                                <div className="border-b-4 border-r-4 border-[#85554C] rounded-br-[1.5em] bg-[#AD8971] p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                        Room
                                                    </p>
                                                    <p className="mt-2 font-black text-white">
                                                        {game.roomId?.roomCode || "Unavailable"}
                                                    </p>
                                                </div>
                                            </>
                                        )}

                                        <div className="border-b-4 border-r-4 border-[#85554C] rounded-br-[1.5em] bg-[#AD8971] p-4 sm:col-span-2">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Played At
                                            </p>
                                            <p className="mt-2 text-sm font-bold text-white">
                                                {game.completedAt
                                                    ? new Date(game.completedAt).toLocaleString()
                                                    : "Unknown"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Record Actions */}
                                    <div className="flex flex-wrap gap-3 bg-[#E7C5B1] px-5 pb-5">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(game)}
                                            className="flex items-center justify-center rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C] active:bg-[#85554C] active:text-white"
                                        >
                                            Edit Record
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(game._id)}
                                            className="flex items-center justify-center rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] active:bg-[#AD8971] active:text-white"
                                        >
                                            Delete Record
                                        </button>
                                    </div>

                                    {/* Edit Form */}
                                    {editingId === game._id && (
                                        <form
                                            onSubmit={handleUpdate}
                                            className="space-y-5 border-t-5 border-[#85554C] bg-[#E7C5B1] p-5"
                                        >
                                            <div>
                                                <h4 className="text-xl font-black text-white drop-shadow-[0_2px_0_#85554C]">
                                                    Edit Game Record
                                                </h4>
                                                <p className="mt-1 text-sm font-semibold text-[#AD8971]">
                                                    Update the recorded time, mistakes, or timeout status.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label htmlFor="finalTime" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                                        Final Time (milliseconds)
                                                    </label>
                                                    <input
                                                        id="finalTime"
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        value={finalTime}
                                                        onChange={(event) =>
                                                            setFinalTime(event.target.value)
                                                        }
                                                        required
                                                        className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label htmlFor="wrongInputs" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                                        Wrong Inputs
                                                    </label>
                                                    <input
                                                        id="wrongInputs"
                                                        type="number"
                                                        min="0"
                                                        step="1"
                                                        value={wrongInputs}
                                                        onChange={(event) =>
                                                            setWrongInputs(event.target.value)
                                                        }
                                                        required
                                                        className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {/* Completed */}
                                                <label className="flex w-fit cursor-pointer items-center gap-3 rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-4 py-3 text-sm font-bold text-white">
                                                    <input
                                                        type="radio"
                                                        name="statusGroup"
                                                        checked={!timedOut && !forfeited}
                                                        onChange={() => {
                                                            setTimedOut(false);
                                                            setForfeited(false);
                                                        }}
                                                        className="h-4 w-4 accent-[#85554C]"
                                                    />
                                                    Completed
                                                </label>

                                                {/* Timed Out */}
                                                <label className="flex w-fit cursor-pointer items-center gap-3 rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-4 py-3 text-sm font-bold text-white">
                                                    <input
                                                        type="radio"
                                                        name="statusGroup"
                                                        checked={timedOut && !forfeited}
                                                        onChange={() => {
                                                            setTimedOut(true);
                                                            setForfeited(false);
                                                        }}
                                                        className="h-4 w-4 accent-[#85554C]"
                                                    />
                                                    Timed Out
                                                </label>

                                                {/* Forfeited */}
                                                <label className="flex w-fit cursor-pointer items-center gap-3 rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-4 py-3 text-sm font-bold text-white">
                                                    <input
                                                        type="radio"
                                                        name="statusGroup"
                                                        checked={forfeited && !timedOut}
                                                        onChange={() => {
                                                            setForfeited(true);
                                                            setTimedOut(false);
                                                        }}
                                                        className="h-4 w-4 accent-[#85554C]"
                                                    />
                                                    Forfeited
                                                </label>
                                            </div>




                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    {saving ? "Saving..." : "Save Changes"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={handleCancel}
                                                    disabled={saving}
                                                    className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Pagination */}
                <footer className="flex flex-col gap-5 border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#85554C] sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                        Showing <span className="text-[#AD8971]">{games.length}</span> records on this page
                        {" "}— <span className="text-[#AD8971]">{totalGames}</span> matching records in total.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => page - 1)}
                            disabled={currentPage <= 1 || loading}
                            className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#AD8971] disabled:hover:text-white"
                        >
                            Previous
                        </button>

                        <span className="min-w-24 text-center text-sm font-black text-[#AD8971]">
                        Page {currentPage} of {Math.max(totalPages, 1)}
                    </span>

                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => page + 1)}
                            disabled={currentPage >= totalPages || loading}
                            className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#AD8971] disabled:hover:text-white"
                        >
                            Next
                        </button>
                    </div>
                </footer>
            </div>
        </main>
    );
};

export default AdminGames;
