import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { CompareProvider } from './context/CompareContext';
import { RoleSwitcher } from './components/layout/RoleSwitcher';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CompareDrawer } from './components/accommodation/CompareDrawer';
import { PageTransition } from './components/layout/PageTransition';

import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { AccommodationDetail } from './pages/AccommodationDetail';
import { Compare } from './pages/Compare';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { HowItWorks } from './pages/HowItWorks';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
        <Route path="/accommodation/:id" element={<PageTransition><AccommodationDetail /></PageTransition>} />
        <Route path="/compare" element={<PageTransition><Compare /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><UserDashboard /></PageTransition>} />
        <Route path="/admin" element={<PageTransition><AdminDashboard /></PageTransition>} />
        <Route path="/how-it-works" element={<PageTransition><HowItWorks /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <WishlistProvider>
          <CompareProvider>
            <div className="flex flex-col min-h-screen">
              {/* Role Switcher Demo Bar */}
              <RoleSwitcher />

              {/* Main Navigation */}
              <Navbar />

              {/* Page Views with Animated Transitions */}
              <div className="flex-1 flex flex-col">
                <AnimatedRoutes />
              </div>

              {/* Floating Compare Dock */}
              <CompareDrawer />

              {/* Footer */}
              <Footer />
            </div>
          </CompareProvider>
        </WishlistProvider>
      </AuthProvider>
    </Router>
  );
};
