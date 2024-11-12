import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from './pages/CreatePost';
import PostPages from './pages/PostPages';
import ProfilePage from './pages/ProfilePage';

function App() {
  const isLoggedIn = localStorage.getItem('authToken');
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path='/' element={isLoggedIn ? <Navigate to="/home" /> : <Login/>} />
              <Route path='/register' element={isLoggedIn ? <Navigate to="/home" /> : <Register/>}  />
              <Route path='/createpost' element={!isLoggedIn ? <Navigate to="/" /> : <CreatePost/>} />
              <Route path='/posts' element ={ <PostPages/> } />
              <Route path='/profile/:username' element={ <ProfilePage/ >} />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
