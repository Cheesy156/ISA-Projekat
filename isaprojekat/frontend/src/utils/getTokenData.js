import {jwtDecode} from 'jwt-decode';
export const getTokenData = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Token not found');
    }
    const decodedToken = jwtDecode(token);

    const { id, username } = decodedToken;
    if (!id || !username) {
        throw new Error('ID or username not found in token');
    }

    return { id, username };
};