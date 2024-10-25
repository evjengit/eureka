import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './App.css';

// Import pages
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';

// Import context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import sample data creator (temporary)
import { createSampleData } from './utils/sampleData';

import { pushLeaderboardData } from '../src/utils/sampleData_Leaderboard'

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Navigation Component
const Navigation: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="flex items-center">
        <Link to="/" id="logo">
          <img src="/logo.jpg" alt="Eureka Logo" />
        </Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Hjem</Link></li>
        <li><Link to="/leaderboard">Toppliste</Link></li>
        {currentUser ? (
          <>
            <li>
              <span className="text-white">
                {userProfile?.username || currentUser.email}
              </span>
            </li>
            <li className='button-sm'>
              <button
                onClick={handleLogout}
                className="text-black"
              >
                Logg ut
              </button>
            </li>
          </>
        ) : (
          <li><Link to="/login">Logg inn</Link></li>
        )}
      </ul>
    </nav>
  );
};

// App Layout Component
const AppLayout: React.FC = () => {
  const handleCreateSampleData = async () => {
    try {
      await createSampleData();
      alert('Sample data created successfully!');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data. Check console for details.');
    }
  };

  const handleCreateLeaderData = async () => {
    try {
      await pushLeaderboardData();
      alert('LEADER data created successfully!');
    } catch (error) {
      console.error('Error creating LEADER data:', error);
      alert('Error creating LEADER data. Check console for details.');
    }
  };

  return (
    <div className="app">
      <Navigation />

      {/* Temporary button for creating sample data */}
      {/*
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <button 
          onClick={handleCreateSampleData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Create Sample Quiz Data
        </button>
        <button
          onClick={handleCreateLeaderData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >Create Leader Data</button>
      </div>
      */}

      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route 
            path="/quiz/:id" 
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/results/:id" 
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            } 
          />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>

      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Eureka Quiz. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
};

export default App;
