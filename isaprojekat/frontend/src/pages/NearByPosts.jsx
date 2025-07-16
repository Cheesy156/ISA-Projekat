import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Link } from 'react-router-dom';
import api from '../utils/axiosInstance';
import '../css/nearByPosts.css';
import { Button, Slider } from "@mui/material";
import L from "leaflet";
import Nav from "../components/Nav";
import '../css/post.css';

const NearByPosts = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radius, setRadius] = useState(5);
    const [selectedPost, setSelectedPost] = useState(null);

    const token = localStorage.getItem("authToken");

    const fetchData = async () => {
        setLoading(true);
        setPosts([]);
        setUserLocation(null);
        try {
            const res = await api.get(`/user_nearby_posts/`, {
                params: { radius },
            });

            const data = res.data;
            setUserLocation(data.user_location);
            setPosts(data.nearby_posts);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPost) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [selectedPost]);

    const closeModal = () => {
        setSelectedPost(null);
        document.body.style.overflow = 'auto';
    };

    const sortComments = (comments) => {
        // Calculates likes + replies
        const getTotalLikesAndReplies = (comment) => {
            const likes = comment.likes_count || 0;
            const replies = comment.subcomments ? comment.subcomments.length : 0;
            return likes + replies;
        };
    
        // Sort the comments array based on total likes + replies in descending order
        return comments.sort((a, b) => {
            const aTotal = getTotalLikesAndReplies(a);
            const bTotal = getTotalLikesAndReplies(b);
            return bTotal - aTotal;  // Sort in descending order
        });
    };

    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.id} className="comment">
                <p><strong><Link to={`/profile/${comment.username}`} style={{ textDecoration: 'none', color: 'inherit' }}> {comment.username} </Link></strong></p>
                <p><em> {comment.text} </em></p>
                
                <div className='buttons-container'>
                    <button 
                        className="like-button" 
                    >
                        <i className="fas fa-heart"></i> {selectedPost.likes_count}
                    </button>

                    <button 
                        className="comment-button"
                    >
                        <i className="fas fa-comment"></i>
                    </button>
                </div>

                {comment.subcomments && comment.subcomments.length > 0 && (
                    <div className="subcomments">
                        {renderComments(comment.subcomments)}
                    </div>
                )}
            </div>
        ));
    };

    const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });

    return (
        <>
        <Nav/>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
        <div style={{ flex: 1, padding: '1rem' }}>
            <h3>Adjust Radius (km)</h3>
            <Slider
            min={1}
            max={40000}
            value={radius}
            onChange={(e, newValue) => setRadius(newValue)}
            valueLabelDisplay="auto"
            />
            <Button variant="contained" onClick={fetchData}>Search</Button>
        </div>
        <div style={{ flex: 4, height: "600px" }}>
            {loading ? (
            <p>Loading map...</p>
            ) : !userLocation ? (
            <p>Could not determine your location from profile data.</p>
            ) : (
            <MapContainer
                center={[userLocation.latitude, userLocation.longitude]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Marker */}
                <Marker position={[userLocation.latitude, userLocation.longitude]} icon={defaultIcon}>
                <Popup>
                    <strong>You are here</strong>
                </Popup>
                </Marker>

                {/* Radius Circle */}
                <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={radius * 1000}
                pathOptions={{ color: 'blue', fillColor: '#add8e6', fillOpacity: 0.3 }}
                />

                {/* Post Markers */}
                {Array.isArray(posts) && posts.map((post) => (
                <Marker
                    key={post.id}
                    position={[post.latitude, post.longitude]}
                    icon={defaultIcon}
                >
                    <Popup>
                        <div style={{ maxWidth: "250px" }}>
                            <strong>
                                <Link to={`/profile/${post.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {post.username}'s
                                </Link>
                            </strong> post<br />
                            {post.text} <br />
                            <strong>Date:</strong> {new Date(post.time_posted).toLocaleString()}
                            {post.picture && (
                            <img
                                src={post.picture}
                                alt="Post"
                                style={{ width: "100%", borderRadius: "8px", marginTop: "5px" }}
                            />
                            )}
                            <br />
                            <button onClick={() => setSelectedPost(post)}>Show More</button>
                        </div>
                    </Popup>
                </Marker>
                ))}
            </MapContainer>
            )}

            {/* Modal */}
            {selectedPost && (
                <div className="modal">
                    <div className="modal-content">
                    <span className="close-button" onClick={closeModal}>&times;</span>

                    {/* Image & Map Section */}
                    <div className="post-details-modal">
                        {selectedPost.picture && (
                        <div className="post-image-detail">
                            <img src={selectedPost.picture} alt="Post" />
                        </div>
                        )}

                        <div style={{ height: '200px', width: '100%' }}>
                        <MapContainer
                            center={[selectedPost.latitude, selectedPost.longitude]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            />
                            <Marker position={[selectedPost.latitude, selectedPost.longitude]} icon={defaultIcon}>
                            <Popup>
                                <strong>
                                <Link
                                    to={`/profile/${selectedPost.username}`}
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    {selectedPost.username}'s
                                </Link>
                                </strong> post<br />
                                {selectedPost.text}<br />
                                <strong>Date:</strong> {new Date(selectedPost.time_posted).toLocaleString()}
                            </Popup>
                            </Marker>
                        </MapContainer>
                        </div>

                        <div className="buttons-container">
                        <button
                            className="like-button"
                        >
                            <i className="fas fa-heart"></i> {selectedPost.likes_count}
                        </button>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="comments-container">
                        <h3>Comments</h3>
                        {renderComments(sortComments(selectedPost.comments))}
                    </div>
                    </div>
                </div>
                )}
            </div>
        </div>
        </>
    );
};

export default NearByPosts;
