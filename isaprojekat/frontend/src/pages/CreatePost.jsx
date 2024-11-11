import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import 'leaflet/dist/leaflet.css';


const CreatePost = () => {
    const [description, setDescription] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [image, setImage] = useState(null);
    const navigate = useNavigate();

    // Drag and drop image handler
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImage(reader.result);
        };
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

    // Map click handler to get coordinates
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setLatitude(e.latlng.lat);
                setLongitude(e.latlng.lng);
            },
        });
        return latitude && longitude ? <Marker position={[latitude, longitude]} /> : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description | !latitude | !longitude) {
            toast.error('Please complete all fields.');
            return;
        }
    
        const token = localStorage.getItem('access_token')
        console.log(token);
        const decodedToken = JSON.parse(atob(localStorage.getItem('access_token').split('.')[1]));
        console.log(decodedToken);
        axios.post(
            'http://127.0.0.1:8000/api/create_post/',
            {
                description,
                latitude,
                longitude,
                image,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                console.log('Post created:', response.data);
                navigate('/home');
            })
            .catch(error => {
                console.error('Error creating post:', error);
        });

    };

    return (
        <div className="create-post-container">
            <h2>Create a New Post</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a description for your post"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Upload a Picture</label>
                    <div {...getRootProps()} className="dropzone">
                        <input {...getInputProps()} />
                        {isDragActive ? (
                            <p>Drop the image here ...</p>
                        ) : (
                            <p>Drag & drop an image here, or click to select one</p>
                        )}
                        {image && <img src={image} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />}
                    </div>
                </div>

                <div className="form-group">
                    <label>Select Location on Map</label>
                    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <LocationMarker />
                    </MapContainer>
                </div>

                <button type="submit" className="submit-btn">
                    Create Post
                </button>
            </form>
        </div>
    );
};

export default CreatePost;
