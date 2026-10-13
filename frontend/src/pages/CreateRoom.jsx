import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const CreateRoom = () => {
    const navigate = useNavigate();

    const [roomCode, setRoomCode] = useState("");
    const [difficulty, setDifficulty] = useState("normal");
    const [error, setError] = useState("");

    // ! create room handler
    const handleCreateRoom = async (event) => {
        event.preventDefault();

        try {
            setError("");

            const response = await api.post("/rooms", {
                roomCode,
                difficulty
            });

            console.log("Room created:", response.data);

            navigate(`/game/${response.data.roomCode}`);

        } catch (error) {
            console.error(
                "Failed to create room:",
                error.response?.data || error
            );

            setError(
                error.response?.data?.message ||
                "Failed to create room"
            );
        }
    };

    return (
    <main className="min-h-screen bg-[#AD8971] px-4 py-8 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">

            {/* Page Header */}
            <header className="relative overflow-hidden border-4 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#85554C] sm:p-8">
                <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#AD8971] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#85554C]" />

                <div className="relative z-10 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#AD8971]">
                        Multiplayer
                    </p>

                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#85554C] sm:text-4xl">
                        Create Room
                    </h1>

                    <p className="max-w-2xl text-sm font-semibold leading-6 text-[#AD8971] sm:text-base">
                        Set up a room and choose the difficulty for your race.
                    </p>
                </div>
            </header>

            {/* Create Room Card */}
            <section className="mx-auto max-w-2xl space-y-6 border-4 border-[#85554C] bg-[#E7C5B1] p-6 text-[#85554C] shadow-[-6px_6px_0_#85554C] sm:p-8">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black">
                        Room Settings
                    </h2>

                    <p className="text-sm font-medium leading-6 text-[#85554C]/80">
                        Enter a room code and select your preferred difficulty before creating the room.
                    </p>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="border-l-4 border-red-600 bg-red-100 p-3 font-semibold text-red-700"
                    >
                        {error}
                    </p>
                )}

                <form onSubmit={handleCreateRoom} className="space-y-6">
                    {/* Room Code */}
                    <div className="space-y-2">
                        <label
                            htmlFor="roomCode"
                            className="block text-sm font-bold uppercase tracking-wider"
                        >
                            Room Code
                        </label>

                        <input
                            id="roomCode"
                            type="text"
                            value={roomCode}
                            onChange={(event) =>
                                setRoomCode(event.target.value.toUpperCase())
                            }
                            placeholder="ABC123"
                            className="w-full border-2 border-[#85554C] bg-white px-4 py-3 font-bold uppercase tracking-widest text-[#85554C] outline-none placeholder:text-[#AD8971] focus:border-[#AD8971] focus:ring-2 focus:ring-[#85554C]/30"
                        />

                        <p className="text-xs font-medium text-[#85554C]/80">
                            Choose a unique code that other players can use to join your room.
                        </p>
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <label
                            htmlFor="difficulty"
                            className="block text-sm font-bold uppercase tracking-wider"
                        >
                            Difficulty
                        </label>

                        <select
                            id="difficulty"
                            value={difficulty}
                            onChange={(event) =>
                                setDifficulty(event.target.value)
                            }
                            className="w-full border-2 border-[#85554C] bg-white px-4 py-3 font-semibold text-[#85554C] outline-none focus:border-[#AD8971] focus:ring-2 focus:ring-[#85554C]/30"
                        >
                            <option value="normal">Normal</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full border-b-4 border-r-4 border-[#85554C] bg-[#85554C] px-6 py-4 font-black uppercase tracking-wider text-white transition-all duration-300 hover:border-[#AD8971] hover:bg-white hover:text-[#85554C] focus:outline-none focus:ring-2 focus:ring-[#85554C] focus:ring-offset-2 focus:ring-offset-[#E7C5B1]"
                    >
                        Create Room →
                    </button>
                </form>
            </section>
        </div>
    </main>
);
};

export default CreateRoom;