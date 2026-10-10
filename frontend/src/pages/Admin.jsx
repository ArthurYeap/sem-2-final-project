import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Admin = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.username}</p>
            <p>Role: {user.role}</p>

            <nav>
                <ul>
                    <li>
                        <Link to="/home">
                            Go back
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/prompts">
                            Manage QTE Prompts
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/users">
                            Manage Users
                        </Link>
                    </li>
                    <li>
                        <Link to="/admin/games">
                            Manage Game Records
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
};

export default Admin;