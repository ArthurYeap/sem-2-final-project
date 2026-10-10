
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

        return users.filter((user) =>
            user.username?.toLowerCase().includes(term) ||
            user.email?.toLowerCase().includes(term)
        );
    }, [users, search]);

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
        <div>
            <h1>User Management</h1>

            <p>
                <Link to="/admin">Back to Dashboard</Link>
            </p>

            <label htmlFor="userSearch">Search users</label>
            <input
                id="userSearch"
                type="search"
                placeholder="Search username or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
            />

            {error && <p role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}

            {editingId && (
                <section>
                    <h2>Edit User</h2>

                    <form onSubmit={handleUpdate}>
                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                required
                            />
                        </div>


                        <div>
                            <label htmlFor="newPassword">
                                New Password (optional)
                            </label>

                            <input
                                id="newPassword"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Leave blank to keep current password"
                                autoComplete="new-password"
                                minLength={8}
                            />

                            <p>
                                Leave blank if you do not want to change this user's password.
                            </p>
                        </div>


                        <button type="submit">Save Changes</button>
                        <button type="button" onClick={handleCancel}>
                            Cancel
                        </button>
                    </form>
                </section>
            )}

            <h2>Registered Users ({filteredUsers.length})</h2>

            {loading ? (
                <p>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
                <p>No matching users found.</p>
            ) : (
                <div>
                    {filteredUsers.map((user) => (
                        <div key={user._id}>
                            <hr />
                            <p><strong>Username:</strong> {user.username}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Role:</strong> {user.role}</p>

                            <button
                                type="button"
                                onClick={() => handleEdit(user)}
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => handleDelete(user)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
