import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

// Components
import SignupForm from './components/SignupForm';
import ServiceRequestForm from './components/ServiceRequestForm';
import QuoteForm from './components/QuoteForm';
import LiveChatWidget from './components/LiveChatWidget'; // New
import VehicleGarageManager from './components/VehicleGarageManager'; // New
import LiveJobMap from './components/LiveJobMap'; // New
import SignatureCaptureModal from './components/SignatureCapture'; // New
import RatingReviewForm from './components/RatingReviewForm'; // New

// Pages (to be created)
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServiceRequests from './pages/ServiceRequests';
import RequestDetails from './pages/RequestDetails';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!user ? <SignupForm /> : <Navigate to="/dashboard" />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
          <Route path="/service-requests" element={user ? <ServiceRequests user={user} /> : <Navigate to="/login" />} />
          <Route path="/service-requests/:id" element={user ? <RequestDetails user={user} /> : <Navigate to="/login" />} />
          <Route path="/request-service" element={user ? <ServiceRequestForm userId={user.uid} /> : <Navigate to="/login" />} />
          <Route path="/my-vehicles" element={user ? <VehicleGarageManager userId={user.uid} /> : <Navigate to="/login" />} /> {/* New Route */}
          <Route path="/job-map" element={user ? <LiveJobMap mechanicId={user.uid} /> : <Navigate to="/login" />} /> {/* New Route */}

          {/* Default route */}
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
        {user && (
          <LiveChatWidget 
            userId={user.uid} 
            userName={user.displayName || user.email} 
            userEmail={user.email} 
            userType={user.userType || 'customer'} // Assuming userType is available in user object
          />
        )}
      </div>
    </Router>
  );
}

export default App;


