import { Link } from 'react-router-dom';
import '../css/nav.css';
import api from '../utils/axiosInstance';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

const Nav = () => {
    const isLoggedIn = localStorage.getItem('authToken');
    const [username, setUsername] = useState(null);
                
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.reload();
    };

    const handleProfile = async () => {
        try {
            api.get('/get_username')
            .then((response) => {
                console.log(response.data);
                setUsername(response.data.username);
            })
            .catch((error) => {
                console.error("Error fetching username:", error);
            });

            if (username) {
                navigate(`/profile/${username}`);
            } else {
                console.error('Username not found.');
            }
        } catch (error) {
            console.error('Error fetching username:', error);
        }
    };

    const handlePosts = () => {
        navigate('/posts');
    };

    const createPost = () => {
        navigate('/createpost')
    }

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
                        <button onClick={handlePosts} className="navbar-item posts-btn">Posts</button>
                        <button onClick={createPost} className='navbar-item createposts-btn'>Create Post</button>
                        <button onClick={handleLogout} className="navbar-item logout-btn">Logout</button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Nav;