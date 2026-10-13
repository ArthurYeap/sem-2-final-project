import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    // ? login handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            login(
                response.data.user,
                response.data.token
            );

            navigate("/home");
        } catch (error) {
            console.log("LOGIN ERROR:", error);
            console.log("RESPONSE:", error.response);

            setError(
                error.response?.data?.message ||
                "Login failed"
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
                            Login
                        </h1>

                        <p className="text-sm font-semibold text-[#85554C]">
                            Welcome back! Sign in to continue.
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

                {/* Login Form */}
                <section className="border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#AD8971] sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#AD8971]"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-11 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#AD8971]"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-11 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#85554C] hover:bg-white hover:text-[#85554C] focus:outline-none focus:ring-2 focus:ring-[#AD8971] focus:ring-offset-2"
                        >
                            Login
                        </button>

                        <div className="border-t-2 border-[#AD8971]/40 pt-4">
                            <p className="mb-3 text-center text-sm font-semibold text-[#85554C]">
                                Don't have an account yet?
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/register")}
                                className="w-full rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#AD8971] hover:bg-white hover:text-[#AD8971] focus:outline-none focus:ring-2 focus:ring-[#AD8971] focus:ring-offset-2"
                            >
                                Create an Account
                            </button>
                        </div>
                    </form>
                </section>

            </div>
        </main>
    );
};

export default Login;