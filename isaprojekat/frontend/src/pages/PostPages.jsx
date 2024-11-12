import React, { useState } from 'react';
import '../css/post.css';
import api from '../utils/axiosInstance';
import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import Nav from "../components/Nav";

const PostPages = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const isAuth = localStorage.getItem('authToken');;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        api.get('/posts/')
            .then((response) => {
                const sortedPosts = response.data.sort((a, b) => new Date(b.time_posted) - new Date(a.time_posted));
                setPosts(sortedPosts);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
    }, []);

    const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
    });

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
    

    const handleShowMore = (post) => {
        setSelectedPost(post);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedPost(null);
        document.body.style.overflow = 'auto';
    };

    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.id} className="comment">
                <p><strong><Link to={`/profile/${comment.username}`} style={{ textDecoration: 'none', color: 'inherit' }}> {comment.username} </Link></strong></p>
                <p><em> {comment.text} </em></p>
                
                <div className='buttons-container'>
                    <button 
                        className={`like-button ${isAuth ? 'enabled' : 'disabled'}`} 
                        disabled={!isAuth}
                    >
                        <i className="fas fa-heart"></i> {selectedPost.likes_count}
                    </button>

                    <button 
                        className={`comment-button ${isAuth ? 'enabled' : 'disabled'}`} 
                        disabled={!isAuth}
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

    if (loading) return <p>Loading...</p>;
    if (!posts) return <p>User not found.</p>;

    return (
        <>
        <Nav/>
        <div>
            <h1 className="title">Post Page</h1>
            <h2 disabled={isAuth}>Login to interact with the community</h2>
            <br></br>
            <div className="home">
                {
                    posts.map((post) => (
                        <div key={post.id} className="post">

                            <div className="post-details">
                                <div className="post-image">
                                    {post.picture && <img src={post.picture} alt="Post slika"/>}
                                </div>
                                <div style={{ height: '170px', width: '100%' }}>
                                    <MapContainer
                                        center={[post.latitude, post.longitude]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                        scrollWheelZoom={false}
                                    >
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        />
                                        <Marker position={[post.latitude, post.longitude]} icon={defaultIcon}>
                                            <Popup>
                                                <strong>
                                                    <Link to={`/profile/${post.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>     
                                                        {post.username}'s
                                                    </Link>
                                                </strong> post<br />
                                                {post.text}<br />
                                                <strong>Date:</strong> {new Date(post.time_posted).toLocaleString()}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>

                                <div className="buttons-container">
                                    <button 
                                            className={`like-button ${isAuth ? 'enabled' : 'disabled'}`} 
                                            disabled={!isAuth}
                                        >
                                            <i className="fas fa-heart"></i> {post.likes_count}
                                    </button>
                                    
                                    <button 
                                        className="show-more-button"
                                        onClick={() => handleShowMore(post)}
                                    >
                                        <i className="fas fa-ellipsis-h"></i> Show More
                                    </button>
                                </div>
                            </div>
                        </div>
                ))}

                {selectedPost && (
                    <div className="modal">
                        
                            <span className="close-button" onClick={closeModal}>&times;</span>
                                <div className="post-details-modal">
                                    {selectedPost.picture && (
                                        <div className="post-image-detail">
                                            <img src={selectedPost.picture} alt="Post slika"/>
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
                                                        <Link to={`/profile/${selectedPost.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {selectedPost.username}'s
                                                        </Link>
                                                    </strong> post<br />
                                                    {selectedPost.text}<br />
                                                    <strong>Date:</strong> {new Date(selectedPost.time_posted).toLocaleString()}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                    <div className='buttons-container'>
                                        <button 
                                            className={`like-button ${isAuth ? 'enabled' : 'disabled'}`} 
                                            disabled={!isAuth}
                                        >
                                            <i className="fas fa-heart"></i> {selectedPost.likes_count}
                                        </button>
                                    </div>
                                </div>

                                <div className="comments-container">
                                    <h3>Comments</h3>
                                    {renderComments(sortComments(selectedPost.comments))}
                                </div>
                            </div>

                    )}
            </div>
        </div>
        </>
    );
};

export default PostPages;