// ! denied login users from accessing login and register pages, except for admin creating a new user
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicOnlyRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();

    // ! check if the user is an admin creating a new user
    const isAdminCreatingUser =
        location.pathname === "/register" &&
        location.state?.from === "/admin/users" &&
        user?.role === "admin";

    if (user && !isAdminCreatingUser) {
        return (
            <Navigate
                to={user.role === "admin" ? "/admin" : "/home"}
                replace
            />
        );
    }

    return children || <Outlet />;
};

export default PublicOnlyRoute;
