import { Link } from 'react-router-dom';
import '../css/nav.css';
import api from '../utils/axiosInstance';
import { useNavigate } from "react-router-dom";

const Nav = () => {
    const isLoggedIn = localStorage.getItem('authToken');

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.reload();
    };

    const handleProfile = async () => {
        try {
            const response = await api.get('/get_username');  // Replace with your actual API endpoint
            const username = response.data.username;

            if (username) {
                navigate(`/profile/${username}`);
            } else {
                console.error('Username not found.');
            }
        } catch (error) {
            console.error('Error fetching username:', error);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-end">
                {!isLoggedIn ? (
                    <>
                        <Link to="/" className="navbar-item">Login</Link>
                        <Link to="/register" className="navbar-item">Register</Link>
                        <Link to="/posts" className='navbar-item'>Posts</Link>
                    </>
                ) : (
                    <>
                        <button onClick={handleProfile} className="navbar-item profile-btn">Profile</button>
                        <button onClick={handleLogout} className="navbar-item logout-btn">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Nav;