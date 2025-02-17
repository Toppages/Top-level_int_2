import './App.css';
import Home from './Home';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

const apiKey = import.meta.env.VITE_API_KEY;
const apiSecret = import.meta.env.VITE_API_SECRET;

function AppContent() {
  const [navOpen, setNavOpen] = useState(true);
  const [activeLink, setActiveLink] = useState(0);
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const location = useLocation();

  const isAuthenticated = apiKey && apiSecret;
  const isLoginPage = location.pathname === "/";

  useEffect(() => {
    if (!isAuthenticated && location.pathname !== "/") {
      window.location.replace('/');
    }
  }, [location.pathname, isAuthenticated]);

  return (
    <>
      {isMobile && !isLoginPage && (
        <Navbar setNavOpen={setNavOpen} setActiveLink={setActiveLink} />
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/home"
            element={isAuthenticated ? (
              <Home
                navOpen={navOpen}
                activeLink={activeLink}
                setActiveLink={setActiveLink}
              />
            ) : (
              <Navigate to="/" />
            )}
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
