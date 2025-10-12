import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

// Components
import Navbar from './components/layout/Navbar.tsx';
import ScrollNavigator from './components/ScrollNavigator.tsx';

// Pages
import HomePage from './pages/HomePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ServicesPage from './pages/ServicesPage.tsx';
import SahalCardPage from './pages/SahalCardPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import GetSahalCardPage from './pages/GetSahalCardPage.tsx';

// Context
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen">
                <Navbar />
                
                <Routes>
                  <Route path="/get-sahal-card" element={<GetSahalCardPage />} />
                  <Route path="/*" element={
                    <ScrollNavigator>
                      {/* Home Section */}
                      <section id="home" data-snap-section className="h-screen">
                        <HomePage />
                      </section>
                      
                      {/* About Section */}
                      <section id="about" data-snap-section className="h-screen">
                        <AboutPage />
                      </section>
                      
                      {/* Services Section */}
                      <section id="services" data-snap-section className="h-screen">
                        <ServicesPage />
                      </section>
                      
                      {/* Sahal Card Section */}
                      <section id="sahal-card" data-snap-section className="min-h-screen">
                        <SahalCardPage />
                      </section>
                      
                      {/* Contact Section */}
                      <section id="contact" data-snap-section className="h-screen">
                        <ContactPage />
                      </section>
                      
                    </ScrollNavigator>
                  } />
                </Routes>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
                
              </div>
            </Router>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;