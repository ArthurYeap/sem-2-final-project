import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // ? handle registration form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        try {
            await api.post("/auth/register", {
                username,
                email,
                password
            });

            setSuccess("Registration successful!");

            // ? send admin to admin users page, else send user to home page after 1 second
            setTimeout(() => {
                if (user?.role === "admin") {
                    navigate("/admin/users", { replace: true });
                } else {
                    navigate("/", { replace: true });
                }
            }, 1000);

        } catch (error) {
            console.log("REGISTER ERROR:", error);

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#85554C] px-4 py-8 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-6">

                {/* Page Header */}
                <header className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#AD8971] sm:p-8">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#85554C] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#AD8971]" />
                    <div className="relative z-10 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                            Account
                        </p>
                        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#AD8971]">
                            Register
                        </h1>
                        <p className="text-sm font-semibold text-[#85554C]">
                            Create your account to get started.
                        </p>
                    </div>
                </header>

                {/* Alerts */}
                {error && (
                    <div
                        role="alert"
                        className="border-4 border-[#AD8971] bg-white px-5 py-4 text-sm font-bold text-[#85554C] shadow-[-5px_0px_#E7C5B1]"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="border-4 border-[#E7C5B1] bg-[#AD8971] px-5 py-4 text-sm font-bold text-white shadow-[-5px_0px_#85554C]"
                    >
                        {success}
                    </div>
                )}

                {/* Register Form */}
                <section className="border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#AD8971] sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                        />

                        <button
                            type="submit"
                            className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C]"
                        >
                            Register
                        </button>
                    </form>
                </section>

                {/* Navigation */}
                <button
                    onClick={() => navigate(user?.role === "admin" ? "/admin/users" : "/")}
                    className="flex w-full items-center justify-center gap-2 rounded-br-[2em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971]"
                >
                    <span aria-hidden="true">←</span>
                    {user?.role === "admin" ? "Go Back to Admin User Dashboard" : "Back to Login"}
                </button>

            </div>
        </main>
    );
};

export default Register;