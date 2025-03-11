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
  const [user, setUser] = useState<{ _id: string; name: string; email: string ;handle: string;role:string;saldo: number;rango: string;}  | null>(null);

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
  // document.addEventListener('contextmenu', (event) => {
  //   event.preventDefault();
  // });
  // document.addEventListener('keydown', (event) => {
  //   if (event.key === 'F12' || (event.ctrlKey && event.shiftKey && event.key === 'I')) {
  //     event.preventDefault();
  //   }
  // });
  
  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_Url}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setIsAuthenticated(true);
      setUser(response.data);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
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
                user={user}
                
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
      <Toaster richColors  position="bottom-right" />
    </Router>
  );
}

export default App;
