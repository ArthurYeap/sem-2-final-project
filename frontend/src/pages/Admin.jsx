import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Admin = () => {
    const { user } = useAuth();

    return (
        <main className="min-h-screen bg-[#85554C] px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-3xl space-y-6">

                {/* Page Header */}
                <header className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#AD8971] sm:p-8">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#85554C] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#AD8971]" />

                    <div className="relative z-10 space-y-3">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                            Administration
                        </p>

                        <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#AD8971] sm:text-4xl">
                            Admin Dashboard
                        </h1>

                        <p className="text-sm font-semibold text-[#85554C]">
                            Welcome, {user.username}
                        </p>
                    </div>
                </header>

                {/* Admin Information */}
                <section className="flex flex-col gap-4 border-4 border-[#E7C5B1] bg-[#AD8971] p-5 shadow-[-6px_6px_0_#E7C5B1] sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#E7C5B1]">
                            Signed-in User
                        </p>
                        <p className="break-words text-xl font-black text-white">
                            {user.username}
                        </p>
                    </div>

                    <div className="w-fit border-2 border-[#E7C5B1] bg-[#85554C] px-4 py-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#E7C5B1]">
                            Role
                        </p>
                        <p className="mt-1 text-sm font-black uppercase text-white">
                            {user.role}
                        </p>
                    </div>
                </section>

                {/* Navigation */}
                <section className="space-y-4">
                    <div className="px-1">
                        <h2 className="text-2xl font-black text-white drop-shadow-[0_2px_0_#AD8971]">
                            Management Menu
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-[#E7C5B1]">
                            Choose an area to manage.
                        </p>
                    </div>

                    <nav>
                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                            <li>
                                <Link
                                    to="/admin/prompts"
                                    className="group block border-4 border-[#E7C5B1] bg-[#AD8971] p-5 shadow-[-5px_5px_0_#E7C5B1] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                                >
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#E7C5B1] group-hover:text-[#85554C]">
                                        Game Content
                                    </p>
                                    <h3 className="mt-2 text-xl font-black text-white group-hover:text-[#85554C]">
                                        Manage QTE Prompts
                                    </h3>
                                    <p className="mt-2 text-sm font-semibold text-white/80 group-hover:text-[#85554C]">
                                        Create and manage quick-time event prompts.
                                    </p>
                                    <span className="mt-4 block text-right font-black text-white group-hover:text-[#85554C]" aria-hidden="true">
                                    →
                                </span>
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/admin/users"
                                    className="group block border-4 border-[#E7C5B1] bg-[#AD8971] p-5 shadow-[-5px_5px_0_#E7C5B1] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                                >
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#E7C5B1] group-hover:text-[#85554C]">
                                        Accounts
                                    </p>
                                    <h3 className="mt-2 text-xl font-black text-white group-hover:text-[#85554C]">
                                        Manage Users
                                    </h3>
                                    <p className="mt-2 text-sm font-semibold text-white/80 group-hover:text-[#85554C]">
                                        View and manage registered accounts.
                                    </p>
                                    <span className="mt-4 block text-right font-black text-white group-hover:text-[#85554C]" aria-hidden="true">
                                    →
                                </span>
                                </Link>
                            </li>

                            <li className="sm:col-span-2">
                                <Link
                                    to="/admin/games"
                                    className="group block border-4 border-[#E7C5B1] bg-[#AD8971] p-5 shadow-[-5px_5px_0_#E7C5B1] transition-all duration-300 hover:-translate-y-1 hover:bg-white"
                                >
                                    <p className="text-xs font-bold uppercase tracking-wider text-[#E7C5B1] group-hover:text-[#85554C]">
                                        Records
                                    </p>
                                    <h3 className="mt-2 text-xl font-black text-white group-hover:text-[#85554C]">
                                        Manage Game Records
                                    </h3>
                                    <p className="mt-2 text-sm font-semibold text-white/80 group-hover:text-[#85554C]">
                                        Review and manage recorded game results.
                                    </p>
                                    <span className="mt-4 block text-right font-black text-white group-hover:text-[#85554C]" aria-hidden="true">
                                    →
                                </span>
                                </Link>
                            </li>

                        </ul>
                    </nav>
                </section>

                {/* Back to Home */}
                <Link
                    to="/home"
                    className="flex w-full items-center justify-center gap-2 rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#85554C] hover:bg-white hover:text-[#85554C]"
                >
                    <span aria-hidden="true">←</span>
                    Go Back
                </Link>

            </div>
        </main>
    );
};

export default Admin;