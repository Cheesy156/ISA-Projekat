import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const isLoggedIn = localStorage.getItem('access_token');
  return (
    <div className="App">
      <BrowserRouter>
          <Routes>
              <Route path='/' element={isLoggedIn ? <Navigate to="/home" /> : <Login/>} />
              <Route path='/register' element={isLoggedIn ? <Navigate to="/home" /> : <Register/>}  />
          </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
