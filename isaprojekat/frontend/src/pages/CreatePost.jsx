import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CreatePost = () => {
    const [text, setText] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [picture, setPicture] = useState(null);
    const navigate = useNavigate();

    // Drag and drop image handler
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setPicture(reader.result);
        };
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

    const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [16, -28],
    });

    // Map click handler to get coordinates
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setLatitude(e.latlng.lat);
                setLongitude(e.latlng.lng);
            },
        });
        return latitude && longitude ? <Marker position={[latitude, longitude]} icon={defaultIcon} /> : null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text | !latitude | !longitude) {
            toast.error('Please complete all fields.');
            return;
        }
    
        const token = localStorage.getItem('authToken')

        axios.post(
            'http://127.0.0.1:8000/api/create_post/',
            {
                text,
                latitude,
                longitude,
                picture,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            .then(response => {
                console.log('Post created:', response.data);
                navigate('/posts');
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
                        value={text}
                        onChange={(e) => setText(e.target.value)}
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
                        {picture && <img src={picture} alt="Preview" style={{ width: '100px', marginTop: '10px' }} />}
                    </div>
                </div>

                <div className="form-group">
                    <label>Select Location on Map</label>
                    <MapContainer center={[45.2396, 19.8227]} zoom={13} style={{ height: '400px', width: '100%' }}>
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
