
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;



    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/users");
            setUsers(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);


    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();

        // ! returning filter users
        return users.filter((user) =>
            user.username?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
    }, [users, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredUsers.length / PAGE_SIZE)
    );

    // ! shows the users for the current page based on the filtered results
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    // ? If the current page exceeds the total pages after filtering, reset to the last page
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleEdit = (user) => {
        setEditingId(user._id);
        setUsername(user.username);
        setEmail(user.email);
        setPassword("");
        setError("");
        setMessage("");
    };

    const handleCancel = () => {
        setEditingId(null);
        setUsername("");
        setPassword("");
        setEmail("");
    };

    const handleUpdate = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            const updates = { username, email };

            if (password.trim()) {
                updates.password = password;
            }

            await api.put(`/users/${editingId}`, updates);

            setMessage("User updated successfully.");
            handleCancel();
            await fetchUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update user."
            );
        }
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Delete the account for ${user.username}? This cannot be undone.`
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await api.delete(`/users/${user._id}`);

            if (editingId === user._id) {
                handleCancel();
            }

            setMessage(`User "${user.username}" deleted.`);
            await fetchUsers();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete user."
            );
        }
    };

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
                            User Management
                        </h1>

                        <p className="max-w-2xl text-sm font-semibold leading-6 text-[#AD8971] sm:text-base">
                            View, search, create, and manage registered users.
                        </p>
                    </div>

                    <Link
                        to="/admin"
                        className="inline-flex w-fit items-center gap-2 rounded-br-[2em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:border-[#85554C] hover:bg-white hover:text-[#85554C] focus:outline-none focus:ring-2 focus:ring-[#AD8971]"
                    >
                        <span aria-hidden="true">←</span>
                        Back to Dashboard
                    </Link>
                </div>
            </header>

            {/* Search and Create User */}
            <section className="space-y-5 border-4 border-[#E7C5B1] bg-[#85554C] p-5 shadow-[-6px_6px_0_#E7C5B1] sm:p-7">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="w-full space-y-2 sm:max-w-xl">
                        <label
                            htmlFor="userSearch"
                            className="block text-sm font-bold uppercase tracking-wider text-[#E7C5B1]"
                        >
                            Search Users
                        </label>

                        <input
                            id="userSearch"
                            type="search"
                            placeholder="Search username or email..."
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border-2 border-[#E7C5B1] bg-[#FFF8F0] px-4 py-3 font-semibold text-[#85554C] outline-none placeholder:text-[#AD8971] focus:border-white focus:ring-2 focus:ring-[#E7C5B1]"
                        />
                    </div>

                    <Link
                        to="/register"
                        state={{ from: "/admin/users" }}
                        className="inline-flex w-fit items-center gap-2 rounded-br-[1.5em] border-b-4 border-r-4 border-[#85554C] bg-[#E7C5B1] px-5 py-3 text-sm font-black text-[#85554C] transition-all duration-300 hover:border-white hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#E7C5B1]"
                    >
                        <span aria-hidden="true">+</span>
                        Create User
                    </Link>
                </div>

                {error && (
                    <p
                        role="alert"
                        className="border-l-4 border-red-300 bg-red-950/30 p-3 font-semibold text-red-100"
                    >
                        {error}
                    </p>
                )}

                {message && (
                    <p
                        role="status"
                        className="border-l-4 border-green-300 bg-green-950/30 p-3 font-semibold text-green-100"
                    >
                        {message}
                    </p>
                )}
            </section>

            {/* Edit User Form */}
            {editingId && (
                <section className="space-y-5 border-4 border-[#E7C5B1] bg-[#85554C] p-5 shadow-[-6px_6px_0_#E7C5B1] sm:p-7">
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E7C5B1]">
                            User Details
                        </p>
                        <h2 className="text-2xl font-black text-white">
                            Edit User
                        </h2>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="username"
                                className="block text-sm font-bold text-[#E7C5B1]"
                            >
                                Username
                            </label>
                            <input
                                id="username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                                className="w-full border-2 border-[#E7C5B1] bg-[#FFF8F0] px-4 py-3 font-semibold text-[#85554C] outline-none focus:border-white focus:ring-2 focus:ring-[#E7C5B1]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-[#E7C5B1]"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                                className="w-full border-2 border-[#E7C5B1] bg-[#FFF8F0] px-4 py-3 font-semibold text-[#85554C] outline-none focus:border-white focus:ring-2 focus:ring-[#E7C5B1]"
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="newPassword"
                                className="block text-sm font-bold text-[#E7C5B1]"
                            >
                                New Password (optional)
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                placeholder="Leave blank to keep current password"
                                autoComplete="new-password"
                                minLength={8}
                                className="w-full border-2 border-[#E7C5B1] bg-[#FFF8F0] px-4 py-3 font-semibold text-[#85554C] outline-none placeholder:text-[#AD8971] focus:border-white focus:ring-2 focus:ring-[#E7C5B1]"
                            />
                            <p className="text-sm leading-6 text-[#E7C5B1]">
                                Leave blank if you do not want to change this user's password.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="border-b-4 border-r-4 border-white bg-[#E7C5B1] px-5 py-3 font-black text-[#85554C] transition-all hover:bg-white"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="border-b-4 border-r-4 border-[#E7C5B1] bg-transparent px-5 py-3 font-bold text-white transition-all hover:bg-[#E7C5B1] hover:text-[#85554C]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Registered Users */}
            <section className="space-y-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E7C5B1]">
                            Account Administration
                        </p>
                        <h2 className="text-2xl font-black text-white sm:text-3xl">
                            Registered Users
                        </h2>
                    </div>

                    <p className="text-sm font-bold text-white">
                        {filteredUsers.length} user
                        {filteredUsers.length !== 1 ? "s" : ""} found
                    </p>
                </div>

                {loading ? (
                    <div className="border-4 border-[#E7C5B1] bg-[#85554C] p-8 text-center font-bold text-[#E7C5B1]">
                        Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="border-4 border-[#E7C5B1] bg-[#85554C] p-8 text-center">
                        <p className="text-lg font-black text-white">
                            No matching users found.
                        </p>
                        <p className="mt-2 text-sm text-[#E7C5B1]">
                            Try another username or email.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {paginatedUsers.map((user) => (
                            <article
                                key={user._id}
                                className="space-y-4 border-4 border-[#E7C5B1] bg-[#85554C] p-5 shadow-[-5px_5px_0_#E7C5B1] transition-transform duration-200 hover:-translate-y-1"
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="min-w-0 space-y-2">
                                        <h3 className="break-words text-xl font-black text-white">
                                            {user.username}
                                        </h3>
                                        <p className="break-all text-sm text-[#E7C5B1]">
                                            {user.email}
                                        </p>
                                    </div>

                                    <span className="w-fit border-2 border-[#E7C5B1] bg-[#AD8971] px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                                        {user.role}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-3 border-t-2 border-[#AD8971] pt-4">
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(user)}
                                        className="border-b-4 border-r-4 border-white bg-[#E7C5B1] px-4 py-2 text-sm font-black text-[#85554C] transition-all hover:bg-white"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDelete(user)}
                                        className="border-b-4 border-r-4 border-[#E7C5B1] bg-transparent px-4 py-2 text-sm font-black text-white transition-all hover:bg-[#E7C5B1] hover:text-[#85554C]"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && filteredUsers.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-4 border-4 border-[#E7C5B1] bg-[#85554C] p-4 shadow-[-4px_4px_0_#E7C5B1]">
                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.max(1, page - 1)
                                )
                            }
                            disabled={currentPage === 1 || loading}
                            className="border-b-4 border-r-4 border-white bg-[#E7C5B1] px-4 py-2 font-black text-[#85554C] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            ← Previous
                        </button>

                        <span className="font-bold text-white">
                            Page {currentPage} of {totalPages}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setCurrentPage((page) =>
                                    Math.min(totalPages, page + 1)
                                )
                            }
                            disabled={currentPage === totalPages || loading}
                            className="border-b-4 border-r-4 border-white bg-[#E7C5B1] px-4 py-2 font-black text-[#85554C] transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next →
                        </button>
                    </div>
                )}
            </section>
        </div>
    </main>
);
};

export default AdminUsers;
