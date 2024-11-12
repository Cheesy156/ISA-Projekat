import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../css/profilePage.css'

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import '../css/post.css';


const ProfilePage = () => {
    const [userposts, setUserPosts] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const { username } = useParams();
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        // Fetch profile and posts
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/profile/${username}/`);
                
                // Set user info and sort posts by `time_posted`
                setUserInfo({
                    first_name: response.data.first_name,
                    last_name: response.data.last_name,
                    address: response.data.address,
                    city: response.data.city,
                    country: response.data.country,
                    profile_pic_base64: response.data.profile_pic_base64,
                    username: response.data.username,
                });
                
                // Sort posts by `time_posted` in descending order and set them
                const sortedPosts = response.data.posts.sort(
                    (a, b) => new Date(b.time_posted) - new Date(a.time_posted)
                );
                setUserPosts(sortedPosts);

                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [username]);

    if (loading) return <p>Loading...</p>;
    if (!userInfo) return <p>User not found.</p>;

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
                <p><strong><Link to={`/profile/${comment.username}`} onClick={closeModal} style={{ textDecoration: 'none', color: 'inherit' }}> {comment.username} </Link></strong></p>
                <p><italic> {comment.text} </italic></p>
                <p><strong>Likes:</strong> {comment.likes_count}</p>
                {comment.subcomments && comment.subcomments.length > 0 && (
                    <div className="subcomments">
                        {renderComments(comment.subcomments)}
                    </div>
                )}
            </div>
        ));
    };

    const handleShowMore = (post) => {
        setSelectedPost(post);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedPost(null);
        document.body.style.overflow = 'auto';
    };

    const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
    });


    return (
        <div className="profile-page">
            <div className="profile-info">
                <img
                    src={userInfo.profile_pic_base64}
                    alt={`No pic`}
                    className="profile-pic"
                />
                <h2>{userInfo.username}</h2>
                <p>{userInfo.first_name} {userInfo.last_name}</p>
                <p>From: {userInfo.city}, <strong> {userInfo.country} </strong></p>
            </div>

            <div className="user-posts">
                <h3>Posts</h3>
                <div className="posts-grid">
                    {userposts.map(posts => (
                        <div key={posts.id} className="post">
                            <img src={posts.picture} alt="post" className="post-image" />
                            <p>{posts.text}</p>
                            <p><strong>{new Date(posts.time_posted).toLocaleString()}</strong></p>
                            <button onClick={() => handleShowMore(posts)}>Show More</button>
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
                                                        <Link to={`/profile/${username}`} onClick={closeModal} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                            {username}'s
                                                        </Link>
                                                    </strong> post<br />
                                                    {selectedPost.text}<br />
                                                    <strong>Date:</strong> {new Date(selectedPost.time_posted).toLocaleString()}
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>

                                    <p><strong>Likes:</strong> {selectedPost.likes_count}</p>
                                </div>

                            <div className="comments-container">
                                <h3>Comments</h3>
                                {renderComments(sortComments(selectedPost.comments))}
                            </div>
                        </div>

                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;