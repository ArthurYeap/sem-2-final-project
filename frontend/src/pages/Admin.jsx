import { useAuth } from "../context/AuthContext";

const Admin = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.username}</p>
            <p>Role: {user.role}</p>
        </div>
    );
};

export default Admin;