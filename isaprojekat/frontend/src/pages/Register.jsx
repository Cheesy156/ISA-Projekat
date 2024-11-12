import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../css/auth.css';
import Nav from "../components/Nav";
import { useDropzone } from 'react-dropzone';

const Register = () => {
    const [email, setEmail] = useState('');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePic, setProfilePic] = useState(null);

    const navigate = useNavigate();

    const validateForm = () => {
        if (!email || !address || !username || !password || !confirmPassword || !firstname || !lastname || !city || !country || !profilePic) {
            toast.error("All fields are required!");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return false;
        }
        return true;
    };

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setProfilePic(reader.result);
        };
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

    const handleRegister = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const response = await axios.post('http://127.0.0.1:8000/api/register/', {
                    email,
                    address,
                    username,
                    password,
                    first_name: firstname,
                    last_name: lastname,
                    city,
                    country,
                    profile_pic_base64: profilePic
                });
                toast.success("User registered successfully!");
                navigate("/"); // Redirect to login page or another page after success
            } catch (error) {
                if (error.response && error.response.data) {
                    const errors = error.response.data;

                    if (errors.username) {
                        toast.error("User with that username already exists");
                    } else if (errors.email) {
                        toast.error("User with that email already exists");
                    } else {
                        toast.error("Registration failed. Please check your input.");
                    }
                } else {
                    toast.error("An error occurred. Please try again.");
                }
            }
        }
    };

    useEffect(() => {
        // checkLoggedIn(navigate);
    }, [navigate]);

    return (
        <>
            <Nav />
            <div className="auth-form-container">
                <h2 className='title'>Register</h2>
                <form onSubmit={handleRegister} className="register-form">
                    <div className="form-section left">
                        <div className="form-group">
                        <label>Profile picture</label>
                        <div {...getRootProps()} className="dropzone">
                            <input {...getInputProps() } required/>
                            {isDragActive ? (
                                <p>Drop the image here ...</p>
                            ) : (
                                <p>Drag & drop an image here, or click to select one</p>
                            )}
                            {profilePic && <img src={profilePic} className='profile-pic' alt="Preview" />}
                        </div>
                    </div>
                        
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                required
                                autoComplete="off"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

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

                        <div className="form-group">
                            <label htmlFor="confirm-password">Confirm Password</label>
                            <input
                                type="password"
                                id="confirm-password"
                                name="confirm-password"
                                placeholder="Enter your password again"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-section right">
                        <div className="form-group">
                            <label htmlFor="firstname">Firstname</label>
                            <input
                                type="text"
                                id="firstname"
                                name="firstname"
                                placeholder="Enter your firstname"
                                required
                                autoComplete="off"
                                value={firstname}
                                onChange={e => setFirstname(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="lastname">Lastname</label>
                            <input
                                type="text"
                                id="lastname"
                                name="lastname"
                                placeholder="Enter your lastname"
                                required
                                autoComplete="off"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="address">Address</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                placeholder="Enter your address"
                                required
                                autoComplete="off"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                            />
                        </div>

                        
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="Enter your city"
                                required
                                autoComplete="off"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="country">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                placeholder="Enter your country"
                                required
                                autoComplete="off"
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <button type="submit" className="auth-submit-btn">
                                Register
                            </button>
                        </div>
                    </div>
                </form>

            </div>
            <ToastContainer />
        </>
    );
};

export default Register;
