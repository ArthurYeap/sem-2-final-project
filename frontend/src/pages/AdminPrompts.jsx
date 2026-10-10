
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const AdminPrompts = () => {
    const [prompts, setPrompts] = useState([]);
    const [promptKey, setPromptKey] = useState("");
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

    return (
        <div>
            <h1>QTE Prompt Management</h1>

            <Link to="/admin">Back to Dashboard</Link>

            <h2>{editingId ? "Edit Prompt" : "Add Prompt"}</h2>

            <form onSubmit={handleSubmit}>
                <label htmlFor="promptKey">Prompt Key</label>

                <input
                    id="promptKey"
                    type="text"
                    value={promptKey}
                    onChange={(event) =>
                        setPromptKey(event.target.value)
                    }
                    placeholder="Enter a key, e.g. W"
                    required
                />

                <button type="submit">
                    {editingId ? "Save Changes" : "Add Prompt"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={handleCancelEdit}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {error && <p role="alert">{error}</p>}
            {message && <p>{message}</p>}

            <h2>Existing Prompts</h2>

            {loading ? (
                <p>Loading prompts...</p>
            ) : prompts.length === 0 ? (
                <p>No prompts found.</p>
            ) : (
                <ul>
                    {prompts.map((prompt) => (
                        <li key={prompt._id}>
                            <strong>{prompt.key}</strong>{" "}

                            <button
                                type="button"
                                onClick={() => handleEdit(prompt)}
                            >
                                Edit
                            </button>{" "}

                            <button
                                type="button"
                                onClick={() => handleDelete(prompt._id)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminPrompts;
