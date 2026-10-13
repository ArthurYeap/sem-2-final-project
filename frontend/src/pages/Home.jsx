import { useState } from "react"; // 1. Added useState to handle the input text
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // 2. Added state to track the typed room code
    const [roomCode, setRoomCode] = useState("");

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // 3. Added a handler function to process the room joining logic
    const handleJoinRoom = (e) => {
        e.preventDefault(); // Prevents page reload if wrapped in a form
        const cleanRoomCode = roomCode.trim().toUpperCase();

        if (cleanRoomCode) {
            navigate(`/game/${cleanRoomCode}`);
        }

    };

    return (
        <main className="min-h-screen bg-[#85554C] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-3xl space-y-6">

                {/* Page Header */}
                <header className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#AD8971] sm:p-8">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#85554C] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#AD8971]" />

                    <div className="relative z-10 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                            Quick Time Event
                        </p>

                        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#AD8971] sm:text-4xl">
                            Welcome to the QTE Game
                        </h1>

                        <p className="text-sm font-semibold text-[#85554C]">
                            Welcome, {user.username}
                        </p>
                    </div>
                </header>

                {/* User Actions */}
                <section className="flex flex-col gap-4 border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#AD8971] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-[#85554C]">
                            Signed in as
                        </p>
                        <p className="mt-1 text-lg font-black text-white drop-shadow-[0_2px_0_#AD8971]">
                            {user.username}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#85554C] hover:bg-white hover:text-[#85554C] focus:outline-none focus:ring-2 focus:ring-[#AD8971] focus:ring-offset-2"
                    >
                        Logout
                    </button>
                </section>

                {/* 4. Added the Room Code Input and Button Container */}
                <section className="space-y-4 border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#AD8971] sm:p-6">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                            Multiplayer
                        </p>
                        <h2 className="text-2xl font-black text-white drop-shadow-[0_2px_0_#AD8971]">
                            Join a Multiplayer Room
                        </h2>
                        <p className="text-sm font-semibold text-[#85554C]">
                            Enter a room code to join your friends.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            placeholder="Enter Room Code..."
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            className="h-11 min-w-0 flex-1 rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                        />

                        <button
                            type="button"
                            onClick={handleJoinRoom}
                            disabled={!roomCode.trim()}
                            className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#85554C] hover:bg-white hover:text-[#85554C] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-white disabled:hover:bg-[#85554C] disabled:hover:text-white"
                        >
                            Join Room
                        </button>
                    </div>
                </section>

                {/* Navigation */}
                <section className="space-y-4">
                    <div className="px-1">
                        <h2 className="text-xl font-black text-white drop-shadow-[0_2px_0_#AD8971]">
                            Game Menu
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#E7C5B1]">
                            Choose how you want to play.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Link
                            to="/game-history"
                            className="group border-4 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-5px_0px_#AD8971] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-[#85554C]">
                                Records
                            </p>
                            <h3 className="mt-2 text-xl font-black text-white drop-shadow-[0_2px_0_#AD8971] group-hover:text-[#85554C] group-hover:drop-shadow-none">
                                Game History
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-[#85554C]">
                                Review your previous games.
                            </p>
                        </Link>

                        <Link
                            to="/create-room"
                            className="group border-4 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-5px_0px_#AD8971] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-[#85554C]">
                                Play Together
                            </p>
                            <h3 className="mt-2 text-xl font-black text-white drop-shadow-[0_2px_0_#AD8971] group-hover:text-[#85554C] group-hover:drop-shadow-none">
                                Create Room
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-[#85554C]">
                                Start a multiplayer game.
                            </p>
                        </Link>

                        <Link
                            to="/singleplayer"
                            className="group border-4 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-5px_0px_#AD8971] transition-all duration-300 hover:-translate-y-1 hover:bg-white sm:col-span-2"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-[#85554C]">
                                Play Solo
                            </p>
                            <h3 className="mt-2 text-xl font-black text-white drop-shadow-[0_2px_0_#AD8971] group-hover:text-[#85554C] group-hover:drop-shadow-none">
                                Singleplayer
                            </h3>
                            <p className="mt-2 text-sm font-semibold text-[#85554C]">
                                Test your reaction speed on your own.
                            </p>
                        </Link>
                    </div>
                </section>

                {user.role === "admin" && (
                    <>
                        {/* Admin Navigation */}
                        <section className="border-4 border-[#AD8971] bg-[#E7C5B1] p-5 shadow-[-5px_0px_#85554C]">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                                Administration
                            </p>

                            <ul className="mt-3">
                                <li>
                                    <Link
                                        to="/admin"
                                        className="inline-flex w-full items-center justify-between rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#85554C] hover:bg-white hover:text-[#85554C]"
                                    >
                                        Admin Dashboard
                                        <span aria-hidden="true">→</span>
                                    </Link>
                                </li>
                            </ul>
                        </section>
                    </>
                )}
            </div>
        </main>
    );
};

export default Home;
