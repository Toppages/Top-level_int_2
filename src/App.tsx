import './App.css';
import Home from './Home';
import Navbar from './Components/Navbar';
import Login from './Pages/Login';
import { useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

function AppContent() {
  const [navOpen, setNavOpen] = useState(true);
  const [activeLink, setActiveLink] = useState(1);
  const isMobile = useMediaQuery('(max-width: 1000px)');
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

  return (
    <>
      {isMobile && !isLoginPage && (
        <Navbar setNavOpen={setNavOpen} setActiveLink={setActiveLink} />
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/Home"
            element={
              <Home
                navOpen={navOpen}
                activeLink={activeLink}
                setActiveLink={setActiveLink}
              />
            }
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
