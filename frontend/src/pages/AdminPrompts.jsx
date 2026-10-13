
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminPrompts = () => {
    const [prompts, setPrompts] = useState([]);
    const [promptKey, setPromptKey] = useState("");
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/qte-prompts");
            setPrompts(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load QTE prompts."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    // ! handle edit and create prompt
    const handleSubmit = async (event) => {
        event.preventDefault();

        const key = promptKey.trim().toUpperCase();

        if (!key) {
            setError("Please enter a prompt key.");
            return;
        }

        try {
            setError("");
            setMessage("");

            if (editingId) {
                await api.put(`/qte-prompts/${editingId}`, { key });
                setMessage("Prompt updated successfully.");
            } else {
                await api.post("/qte-prompts", { key });
                setMessage("Prompt created successfully.");
            }

            setPromptKey("");
            setEditingId(null);

            await fetchPrompts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to save the prompt."
            );
        }
    };

    const handleEdit = (prompt) => {
        setEditingId(prompt._id);
        setPromptKey(prompt.key);
        setError("");
        setMessage("");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setPromptKey("");
        setError("");
        setMessage("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this prompt?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setMessage("");

            await api.delete(`/qte-prompts/${id}`);

            if (editingId === id) {
                handleCancelEdit();
            }

            setMessage("Prompt deleted successfully.");
            await fetchPrompts();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete the prompt."
            );
        }
    };

    const filteredPrompts = prompts.filter((prompt) =>
        prompt.key.toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <main className="min-h-screen bg-[#85554C] px-4 py-8 text-white sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl space-y-8">

                {/* Page Header */}
                <header className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-6 shadow-[-8px_0px_#AD8971] sm:p-8">
                    <div className="absolute -left-8 -top-8 h-20 w-20 rounded-br-full bg-[#85554C] shadow-[0.25em_0.25em_0em_1em_#E7C5B1,0.25em_0.25em_0em_1.5em_#AD8971]" />

                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#85554C]">
                                Administration
                            </p>
                            <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#AD8971] sm:text-4xl">
                                QTE Prompt Management
                            </h1>
                        </div>

                        <Link
                            to="/admin"
                            className="inline-flex w-fit items-center gap-2 rounded-br-[2em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971] focus:outline-none focus:ring-2 focus:ring-[#85554C]"
                        >
                            <span aria-hidden="true">←</span>
                            Back to Dashboard
                        </Link>
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

                {message && (
                    <div
                        role="status"
                        className="border-4 border-[#E7C5B1] bg-[#AD8971] px-5 py-4 text-sm font-bold text-white shadow-[-5px_0px_#85554C]"
                    >
                        {message}
                    </div>
                )}

                {/* Add / Edit Prompt Form */}
                <section className="relative overflow-hidden border-5 border-[#E7C5B1] bg-[#E7C5B1] p-5 shadow-[-6px_0px_#AD8971] sm:p-6">
                    <div className="mb-5">
                        <h2 className="text-xl font-black text-white drop-shadow-[0_2px_0_#AD8971]">
                            {editingId ? "Edit Prompt" : "Add Prompt"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="promptKey"
                                className="block text-sm font-bold text-white drop-shadow-[0_2px_0_#AD8971]"
                            >
                                Prompt Key
                            </label>
                            <input
                                id="promptKey"
                                type="text"
                                value={promptKey}
                                onChange={(event) =>
                                    setPromptKey(event.target.value)
                                }
                                placeholder="Enter a key, e.g. W"
                                required
                                className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#85554C] px-3 text-sm font-bold text-[#E7C5B1] outline-none transition-all duration-300 placeholder:text-[#E7C5B1]/60 hover:bg-white hover:text-[#85554C] focus:bg-white focus:text-[#85554C]"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#85554C] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C]"
                            >
                                {editingId ? "Save Changes" : "Add Prompt"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="rounded-br-[1.5em] border-b-4 border-r-4 border-white bg-[#AD8971] px-5 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971]"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Existing Prompts */}
                <section className="space-y-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <h2 className="text-2xl font-black text-white drop-shadow-[0_3px_0_#AD8971]">
                            Existing Prompts
                        </h2>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search prompt key..."
                            aria-label="Search prompt key"
                            className="h-10 w-full rounded-br-[1.5em] border-b-4 border-r-4 border-[#AD8971] bg-[#E7C5B1] px-3 text-sm font-bold text-[#85554C] outline-none transition-all duration-300 placeholder:text-[#85554C]/50 hover:bg-white focus:bg-white sm:max-w-xs"
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center gap-3 border-4 border-[#E7C5B1] bg-[#E7C5B1] px-6 py-5 shadow-[-6px_0px_#AD8971]">
                            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-[#AD8971]" />
                            <p className="text-sm font-bold drop-shadow-[0_2px_0_#AD8971]">
                                Loading prompts...
                            </p>
                        </div>
                    ) : prompts.length === 0 ? (
                        <div className="border-5 border-dashed border-[#E7C5B1] bg-[#85554C] px-6 py-14 text-center shadow-[-6px_0px_#AD8971]">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-br-[1.5em] bg-[#AD8971] text-2xl font-black text-white">
                                —
                            </div>
                            <p className="text-lg font-black text-white">No prompts found.</p>
                        </div>
                    ) : filteredPrompts.length === 0 ? (
                        <div className="border-5 border-dashed border-[#E7C5B1] bg-[#85554C] px-6 py-14 text-center shadow-[-6px_0px_#AD8971]">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-br-[1.5em] bg-[#AD8971] text-2xl font-black text-white">
                                —
                            </div>
                            <p className="text-lg font-black text-white">No prompts match your search.</p>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredPrompts.map((prompt) => (
                                <li
                                    key={prompt._id}
                                    className="flex items-center justify-between gap-4 border-5 border-[#E7C5B1] bg-[#E7C5B1] p-4 shadow-[-4px_0px_#AD8971] transition-all duration-300 hover:-translate-y-1 hover:shadow-[-6px_4px_#AD8971]"
                                >
                                    <strong className="rounded-br-[1em] border-b-2 border-r-2 border-white bg-[#85554C] px-4 py-2 text-sm font-black text-[#E7C5B1]">
                                        {prompt.key}
                                    </strong>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(prompt)}
                                            className="rounded-br-[1.2em] border-b-4 border-r-4 border-white bg-[#AD8971] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#AD8971] hover:border-[#AD8971]"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(prompt._id)}
                                            className="rounded-br-[1.2em] border-b-4 border-r-4 border-white bg-[#85554C] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-white hover:text-[#85554C] hover:border-[#85554C]"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

            </div>
        </main>
    );
};

export default AdminPrompts;
