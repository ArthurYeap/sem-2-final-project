import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter ,RouterProvider} from 'react-router-dom'
import {AuthProvider} from './context/AuthContext.jsx'
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import Singleplayer
    from "./pages/Singleplayer.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Admin from "./pages/Admin.jsx";
import Register from "./pages/Register.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import Game from "./pages/Game";
import GameHistory from "./pages/GameHistory.jsx";
import CreateRoom from "./pages/CreateRoom.jsx";
import './index.css'

const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "*",
        element: <NotFound />
    },
    {
        path: "/game-history",
        element: (
            <ProtectedRoute>
                <GameHistory />
            </ProtectedRoute>
        )
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/singleplayer",
        element: (
            <ProtectedRoute>
                <Singleplayer />
            </ProtectedRoute>
        )
    },
    {
        path: "/create-room",
        element: (
            <ProtectedRoute>
                <CreateRoom />
            </ProtectedRoute>
        )
    },
    {
        path: "/home",
        element: (
            <ProtectedRoute>
                <Home />
            </ProtectedRoute>
        )
    },
    {
        path: "/game/:roomCode",
        element: (
            <ProtectedRoute>
                <Game />
            </ProtectedRoute>
        )
    },
    {
        path: "/admin",
        element: (
            <AdminRoute>
                <Admin />
            </AdminRoute>
        )
    }
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
        <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
