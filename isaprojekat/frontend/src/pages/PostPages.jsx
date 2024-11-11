import React, { useState } from 'react';
import '../css/post.css';
import axios from 'axios';
import { useEffect } from 'react';
/*
const dummyPosts = [
    {
        id: 1,
        text: "Ovo je prvi post sa višeslojnim komentarima.",
        latitude: 45.2671,
        longitude: 19.8335,
        time_posted: "2024-11-11T12:00:00Z",
        picture: "https://example.com/slika1.jpg",
        user_likes: 10,
        user: {
            username: "korisnik1",
        },
        comments: [
            {
                id: 1,
                text: "Prvi nivo komentara na prvi post.",
                user_id: 1,
                parent_comment: null,
                likes: 10,
                subcomments: [
                    {
                        id: 2,
                        text: "Pod-komentar na prvi nivo komentara.",
                        user_id: 2,
                        parent_comment: 1,
                        likes: 8,
                        subcomments: [
                            {
                                id: 3,
                                text: "Pod-pod-komentar na pod-komentar.",
                                user_id: 3,
                                parent_comment: 2,
                                likes: 3,
                                subcomments: [
                                    {
                                        id: 4,
                                        text: "Još dublji komentar.",
                                        user_id: 4,
                                        parent_comment: 3,
                                        likes: 3,
                                        subcomments: [
                                            {
                                                id: 5,
                                                text: "Najdublji komentar.",
                                                user_id: 5,
                                                parent_comment: 4,
                                                likes: 3,
                                                subcomments: []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 2,
        text: "Drugi post sa još više informacija.",
        latitude: 44.7866,
        longitude: 20.4489,
        time_posted: "2024-11-10T14:30:00Z",
        picture: "https://example.com/slika2.jpg",
        user_likes: 10,
        user: {
            username: "korisnik2",
        },
        comments: [
            {
                id: 6,
                text: "Prvi komentar na drugi post.",
                user_id: 6,
                parent_comment: null,
                likes: 3,
                subcomments: [
                    {
                        id: 7,
                        text: "Pod-komentar na prvi komentar drugog posta.",
                        user_id: 7,
                        parent_comment: 6,
                        likes: 3,
                        subcomments: [
                            {
                                id: 8,
                                text: "Pod-pod-komentar na drugi post.",
                                user_id: 8,
                                parent_comment: 7,
                                likes: 3,
                                subcomments: []
                            }
                        ]
                    }
                ]
            },
            {
                id: 9,
                text: "Drugi komentar na drugi post bez dodatnih nivoa.",
                user_id: 9,
                parent_comment: null,
                likes: 3,
                subcomments: []
            }
        ]
    },
    {
        id: 3,
        text: "Treći post sa kompleksnom strukturom komentara.",
        latitude: 43.5081,
        longitude: 16.4402,
        time_posted: "2024-11-09T10:00:00Z",
        picture: "https://example.com/slika3.jpg",
        user_likes: 15,
        user: {
            username: "korisnik3",
        },
        comments: [
            {
                id: 10,
                text: "Prvi komentar sa nekoliko nivoa pod-komentara.",
                user_id: 10,
                parent_comment: null,
                likes: 3,
                subcomments: [
                    {
                        id: 11,
                        text: "Pod-komentar na prvi komentar trećeg posta.",
                        user_id: 11,
                        parent_comment: 10,
                        likes: 3,
                        subcomments: [
                            {
                                id: 12,
                                text: "Još jedan pod-komentar sa dodatnim slojem.",
                                user_id: 12,
                                parent_comment: 11,
                                likes: 3,
                                subcomments: [
                                    {
                                        id: 13,
                                        text: "Dubok pod-komentar sa dodatnim komentarima.",
                                        user_id: 13,
                                        parent_comment: 12,
                                        likes: 3,
                                        subcomments: [
                                            {
                                                id: 14,
                                                text: "Konačni komentar u hijerarhiji.",
                                                user_id: 14,
                                                parent_comment: 13,
                                                likes: 3,
                                                subcomments: []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                id: 15,
                text: "Drugi komentar bez pod-komentara.",
                user_id: 15,
                parent_comment: null,
                likes: 3,
                subcomments: []
            }
        ]
    },
    {
        id: 4,
        text: "Četvrti post bez komentara.",
        latitude: 42.6983,
        longitude: 23.3199,
        time_posted: "2024-11-08T09:15:00Z",
        picture: "https://example.com/slika3.jpg",
        user_likes: 15,
        user: {
            username: "korisnik4",
        },
        comments: []
    }
    ,
    {
        id: 5,
        text: "Četvrti post bez komentara.",
        latitude: 42.6983,
        longitude: 23.3199,
        time_posted: "2024-11-08T09:15:00Z",
        picture: "https://example.com/slika3.jpg",
        user_likes: 15,
        user: {
            username: "korisnik4",
        },
        comments: []
    },
    {
        id: 6,
        text: "Četvrti post bez komentara.",
        latitude: 42.6983,
        longitude: 23.3199,
        time_posted: "2024-11-08T09:15:00Z",
        picture: "https://example.com/slika3.jpg",
        user_likes: 15,
        user: {
            username: "korisnik4",
        },
        comments: []
    },
    {
        id: 7,
        text: "Četvrti post bez komentara.",
        latitude: 42.6983,
        longitude: 23.3199,
        time_posted: "2024-11-08T09:15:00Z",
        picture: "https://example.com/slika3.jpg",
        user_likes: 15,
        user: {
            username: "korisnik4",
        },
        comments: []
    }
];
*/

const PostPages = () => {
    const [selectedPost, setSelectedPost] = useState(null);
    const isAuth = false;
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch posts from the api/posts
        axios.get('http://127.0.0.1:8000/api/posts/')
            .then((response) => {
                setPosts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching posts:", error);
                setLoading(false);
            });
    }, []);

    console.log(posts)

    const handleShowMore = (post) => {
        setSelectedPost(post);
    };

    const closeModal = () => {
        setSelectedPost(null);
    };

    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.id} className="comment">
                <p><strong>Username:</strong> {comment.username}</p>
                <p><strong>Komentar:</strong> {comment.text}</p>
                <p><strong>Likes:</strong> {comment.likes_count}</p>
                {comment.subcomments && comment.subcomments.length > 0 && (
                    <div className="subcomments">
                        {renderComments(comment.subcomments)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div>
            <h1 className="title">Post Page</h1>
            <div className="home">
                {
                    posts.map((post) => (
                        <div key={post.id} className="post">
                            <div className="post-image">
                                {post.picture && <img src={post.picture} alt="Post slika"/>}
                            </div>
                            <div className="post-details">
                                <p><strong>Username:</strong> {post.username}</p>
                                <p><strong>Content:</strong> {post.text}</p>
                                <p><strong>Date:</strong> {new Date(post.time_posted).toLocaleString()}</p>
                                <p><strong>Location:</strong> {post.latitude}, {post.longitude}</p>
                                <p><strong>Likes:</strong> {post.likes_count}</p>
                                <button onClick={() => handleShowMore(post)}>Show More</button>
                                {isAuth && <button>Edit Post</button>}
                            </div>
                        </div>
                ))}

                {selectedPost && (
                    <div className="modal">
                        <div className="modal-content">
                            <span className="close-button" onClick={closeModal}>&times;</span>
                            <h2>Detalji Posta</h2>
                            <div className="post-details-modal">
                                <p><strong>Username:</strong> {selectedPost.username}</p>
                                <p><strong>Content:</strong> {selectedPost.text}</p>
                                <p><strong>Date:</strong> {new Date(selectedPost.time_posted).toLocaleString()}</p>
                                <p><strong>Location:</strong> {selectedPost.latitude}, {selectedPost.longitude}</p>
                                <p><strong>Likes:</strong> {selectedPost.likes_count}</p>
                                {selectedPost.picture && (
                                    <div className="post-image">
                                        <img src={selectedPost.picture} alt="Post slika"/>
                                    </div>
                                )}
                            </div>
                                <h3>Komentari</h3>
                                <div className="comments-container">
                                    {renderComments(selectedPost.comments)}
                                </div>
                            </div>
                        </div>
                        )}
                    </div>
        </div>
    );
};

export default PostPages;