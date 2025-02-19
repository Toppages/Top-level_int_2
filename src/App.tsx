import './App.css';
import Home from './Home';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import { useState, useEffect } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import axios from 'axios';

function AppContent() {
  const [navOpen, setNavOpen] = useState(true);
  const [activeLink, setActiveLink] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);  
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isLoginPage = location.pathname === "/";

  useEffect(() => {
    if (token) {
      verifyToken(token);
    } else {
      setIsAuthenticated(false); 
    }
  }, [token]);
  

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get('http://localhost:4000/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userData = response.data;
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(userData)); // Actualiza userData en localStorage
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setIsAuthenticated(false);
      localStorage.setItem('isAuthenticated', 'false');
      toast.error('Sesión expirada. Inicie sesión nuevamente.');
    }
  };
  

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <>
      {isMobile && !isLoginPage && (
        <Navbar setNavOpen={setNavOpen} setActiveLink={setActiveLink} />
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
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
      <Toaster position="bottom-right" />
    </Router>
  );
}

export default App;
