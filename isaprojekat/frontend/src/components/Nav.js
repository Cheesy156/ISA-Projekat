import { Link } from 'react-router-dom';
import '../css/nav.css';
const Nav = () => {
    const isLoggedIn = false;

    const handleLogout = () => {
        console.log("Logout");
        // localStorage.removeItem('user');
        // localStorage.removeItem('token');
        // window.location.reload();
    };

    return (
        <nav className="navbar">
            <div className="navbar-end">
                {!isLoggedIn ? (
                    <>
                        <Link to="/" className="navbar-item">Login</Link>
                        <Link to="/register" className="navbar-item">Register</Link>
                    </>
                ) : (
                    <button onClick={handleLogout} className="navbar-item logout-btn">Logout</button>
                )}
            </div>
        </nav>
    );
}

export default Nav;