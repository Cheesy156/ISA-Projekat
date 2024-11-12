import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { loginUser, checkLoggedIn } from "../utils/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../css/auth.css';
import Nav from "../components/Nav";
import api from '../utils/axiosInstance';

const Login = () => {
    const host = process.env.REACT_APP_HOST;

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login/', {
                username_or_email: username,
                password: password,
            });

            if (response.data) {
                // Store the access token in localStorage
                // Save the tokens to localStorage
                console.log(response.data);
                console.log(response.data.access);
                localStorage.setItem('authToken', response.data.access);
                localStorage.setItem('refreshToken', response.data.refresh);
                toast.success(response.data.message || "Login successful!");
                //navigate("/dashboard"); // Redirect to a dashboard or home page after login
            } else {
                toast.error("Login failed. Please try again.");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message || "Login failed");
            } else {
                toast.error("An error occurred. Please try again.");
            }
        }   
    }

    useEffect(() => {
        checkLoggedIn(navigate);
    }, [navigate]);

    return (
        <>
            <Nav/>
            <div className="auth-login-container">
            <h2 className='title'>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        required
                        autoComplete="off"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" className="auth-submit-btn">
                    Login
                </button>
            </form>
            </div>
        <ToastContainer/>
        </>
    );
};

export default Login;