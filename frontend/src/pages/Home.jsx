import { useEffect } from "react";
import api from "../api/axios";

const Home = () => {

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await api.get("/users");

                console.log(response.data);
            } catch (error) {
                console.log(error.response?.data);
            }
        };

        getUsers();
    }, []);

    return <h1>Welcome to the QTE Game</h1>;
};

export default Home;