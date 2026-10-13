import { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";

const PAGE_SIZE = 10;

const GameHistory = () => {
    const [games, setGames] = useState([]);
    const [mode, setMode] = useState("all");
    const [status, setStatus] = useState("all");
    const [sort, setSort] = useState("newest");
    const [roomSearch, setRoomSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGames, setTotalGames] = useState(0);
    const [difficulty, setDifficulty] = useState("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

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

                if (status !== "all") {
                    params.status = status;
                }
                if (difficulty !== "all") {
                    params.difficulty = difficulty;
                }

                if (roomSearch.trim()) {
                    params.roomCode = roomSearch.trim();
                }

                const response = await api.get("/games", { params });

                if (cancelled) return;

                const data = response.data;

                // ! make sure it's an array
                const gameList = Array.isArray(data)
                    ? data
                    : Array.isArray(data.games)
                        ? data.games
                        : [];

                setGames(gameList);
                setTotalPages(
                    Array.isArray(data)
                        ? 1
                        : Math.max(1, data.totalPages ?? 1)
                );
                setTotalGames(
                    Array.isArray(data)
                        ? gameList.length
                        : data.totalGames ?? gameList.length
                );
            } catch (err) {
                if (cancelled) return;

                setGames([]);
                setTotalPages(1);
                setTotalGames(0);

                setError(
                    err.response?.data?.message ||
                    "Failed to load game history."
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        // * Avoid making a request for every keystroke in room search.
        const timer = setTimeout(fetchGames, 300);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [currentPage, mode, status, sort, roomSearch, difficulty]);


    // ? a function to handle filter changes setter and reset the current page to 1
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    // ! Format milliseconds to MM:SS.CS
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

    // ! Reset all filters to their default values
    const clearFilters = () => {
        setMode("all");
        setStatus("all");
        setDifficulty("all");
        setSort("newest");
        setRoomSearch("");
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-8">
                <div className="flex flex-col gap-8">

                    {/* Page Header */}
                    <header className="relative flex flex-col justify-between gap-6 overflow-hidden border-[5px] border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#85554C] sm:p-8 md:flex-row md:items-center">

                        {/* Decorative Top-Left Circle */}
                        <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#AD8971] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#85554C]" />

                        {/* Title Text Content */}
                        <div className="relative z-10 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                                Player
                            </p>
                            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                                Game History
                            </h1>
                            <p className="max-w-2xl text-sm font-semibold leading-6 text-[#AD8971] sm:text-base">
                                View your past games, results, and performance.
                            </p>
                        </div>

                        {/* Back To Home Button */}
                        <div className="relative z-10 flex items-center">
                            <Link
                                to="/home"
                                className="flex w-full items-center justify-center gap-2 rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#AD8971] hover:bg-white hover:text-[#AD8971] md:w-auto"
                            >
                                <span aria-hidden="true">←</span>
                                Back To Home
                            </Link>
                        </div>
                    </header>

                {/* Filters and search */}
                <section className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#85554C] sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-xl font-black text-white drop-shadow-[0_2px_0_#85554C]">
                            Find Games
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#AD8971]">
                            Filter and sort your history to find the game you need.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="space-y-2">
                            <label htmlFor="game-mode" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Game Mode
                            </label>
                            <select
                                id="game-mode"
                                value={mode}
                                onChange={(event) =>
                                    handleFilterChange(setMode, event.target.value)
                                }
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="all">All Modes</option>
                                <option value="singleplayer">Singleplayer</option>
                                <option value="multiplayer">Multiplayer</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="game-status" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Game Status
                            </label>
                            <select
                                id="game-status"
                                value={status}
                                onChange={(event) =>
                                    handleFilterChange(setStatus, event.target.value)
                                }
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="all">All Statuses</option>
                                <option value="completed">Completed</option>
                                <option value="timedOut">Timed Out</option>
                                <option value="forfeited">Forfeited</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="difficulty-filter" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Difficulty
                            </label>
                            <select
                                id="difficulty-filter"
                                value={difficulty}
                                onChange={(event) =>
                                    handleFilterChange(setDifficulty, event.target.value)
                                }
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="">All Difficulties</option>
                                <option value="normal">Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="game-sort" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Sort By
                            </label>
                            <select
                                id="game-sort"
                                value={sort}
                                onChange={(event) =>
                                    handleFilterChange(setSort, event.target.value)
                                }
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 py-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="fastest">Fastest Time</option>
                                <option value="slowest">Slowest Time</option>
                                <option value="fewestMistakes">Fewest Wrong Inputs</option>
                                <option value="mostMistakes">Most Wrong Inputs</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="room-search" className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                                Search Room Code
                            </label>
                            <input
                                id="room-search"
                                type="text"
                                value={roomSearch}
                                onChange={(event) =>
                                    handleFilterChange(setRoomSearch, event.target.value)
                                }
                                placeholder="Enter room code..."
                                className="h-[50px] w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#AD8971] focus:bg-white focus:text-[#AD8971]"
                            />
                        </div>

                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t-4 border-[#AD8971]/20 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm font-semibold text-[#AD8971]">
                            Use the filters above to narrow down your history.
                        </p>
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="flex w-fit items-center justify-center rounded-br-[2em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C] active:bg-[#85554C] active:text-white"
                        >
                            Clear Filters
                        </button>
                    </div>
                </section>

                {/* Error alert */}
                {error && (
                    <div
                        role="alert"
                        className="border-4 border-[#85554C] bg-white px-5 py-4 text-sm font-bold text-[#AD8971] shadow-[-5px_0px_#E7C5B1]"
                    >
                        {error}
                    </div>
                )}

                {/* Game Records */}
                <section className="space-y-5">
                    <div>
                        <h2 className="text-2xl font-black text-white drop-shadow-[0_3px_0_#85554C]">
                            Game Records
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#E7C5B1]">
                            {totalGames} matching games in total
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-3 border-4 border-[#E7C5B1] bg-[#E7C5B1] px-6 py-5 shadow-[-6px_0px_#85554C]">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-[#85554C]" />
                            <p className="text-sm font-bold drop-shadow-[0_2px_0_#85554C]">
                                Loading game history...
                            </p>
                        </div>
                    ) : games.length === 0 ? (
                        <div className="border-5 border-dashed border-[#E7C5B1] bg-[#AD8971] px-6 py-14 text-center shadow-[-6px_0px_#85554C]">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-br-[1.5em] bg-[#85554C] text-2xl font-black text-white">
                                —
                            </div>
                            <h3 className="text-lg font-black text-white">
                                No game history found.
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-[#E7C5B1]">
                                Try changing or clearing your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {games.map((game) => (
                                <article
                                    key={game._id}
                                    className="group relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] shadow-[-6px_0px_#85554C] transition-all duration-300 hover:-translate-y-1 hover:shadow-[-9px_5px_#85554C]"
                                >
                                    {/* Card Header */}
                                    <div className="relative flex flex-col gap-4 border-b-4 border-[#AD8971]/20 bg-[#E7C5B1] p-5 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#AD8971]">
                                                Mode
                                            </p>
                                            <h2 className="mt-1 break-words text-xl font-black text-white drop-shadow-[0_2px_0_#85554C]">
                                                {game.mode === "singleplayer"
                                                    ? "Singleplayer"
                                                    : "Multiplayer"}
                                            </h2>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className="rounded-br-[1em] border-b-2 border-r-2 border-white bg-[#AD8971] px-3 py-2 text-xs font-bold capitalize text-[#E7C5B1]">
                                                {game.difficulty ||
                                                    game.roomId?.difficulty ||
                                                    "N/A"}
                                            </span>
                                            <span
                                                className={`rounded-br-[1em] border-b-2 border-r-2 border-white px-3 py-2 text-xs font-bold text-white ${
                                                    game.forfeited || game.timedOut
                                                        ? "bg-[#85554C]"
                                                        : "bg-[#AD8971]"
                                                }`}
                                            >
                                                {game.forfeited
                                                    ? "Forfeited"
                                                    : game.timedOut
                                                        ? "Timed Out"
                                                        : "Completed"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Game Statistics */}
                                    <div className="grid grid-cols-1 gap-4 bg-[#E7C5B1] p-5 sm:grid-cols-2">
                                        <div className="rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Final Time
                                            </p>
                                            <p className="mt-2 font-black tabular-nums text-white">
                                                {formatTime(game.finalTime)}
                                            </p>
                                        </div>

                                        <div className="rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] p-4">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Wrong Inputs
                                            </p>
                                            <p className="mt-2 font-black tabular-nums text-white">
                                                {game.wrongInputs}
                                            </p>
                                        </div>

                                        {game.mode === "multiplayer" && (
                                            <>
                                                <div className="rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] p-4">
                                                    <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                        Room Code
                                                    </p>
                                                    <p className="mt-2 font-black text-white">
                                                        {game.roomId?.roomCode ?? "N/A"}
                                                    </p>
                                                </div>

                                                {game.rank != null && (
                                                    <div className="rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] p-4">
                                                        <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                            Rank
                                                        </p>
                                                        <p className="mt-2 font-black text-white">
                                                            {game.rank}
                                                        </p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <div className="rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#AD8971] p-4 sm:col-span-2">
                                            <p className="text-xs font-bold uppercase tracking-wide text-[#E7C5B1]">
                                                Played
                                            </p>
                                            <p className="mt-2 text-sm font-bold text-white">
                                                {new Date(game.completedAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Pagination */}
                <footer className="flex flex-col gap-5 border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#85554C] sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-white drop-shadow-[0_2px_0_#85554C]">
                        Showing <span className="text-[#AD8971]">{games.length}</span> records on this page
                        {" "}— <span className="text-[#AD8971]">{totalGames}</span> matching games in total.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setCurrentPage((page) => page - 1)}
                            className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#AD8971] disabled:hover:text-white"
                        >
                            Previous
                        </button>

                        <span className="min-w-24 text-center text-sm font-black text-[#AD8971]">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() => setCurrentPage((page) => page + 1)}
                            className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#AD8971] disabled:hover:text-white"
                        >
                            Next
                        </button>
                    </div>
                </footer>

                </div>
            </div>
        </main>
    );
};



export default GameHistory;