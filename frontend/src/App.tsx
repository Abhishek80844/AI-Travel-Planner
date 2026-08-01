import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateTripPage } from './pages/CreateTripPage';
import { TripDetailsPage } from './pages/TripDetailsPage';
import { SharedTripPage } from './pages/SharedTripPage';
import { MapsPage } from './pages/MapsPage';
import { AiChatDrawer } from './components/AiChatDrawer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isTripDetailsPage = location.pathname.startsWith('/trips/');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 relative">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/share/:shareToken" element={<SharedTripPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-trip" element={<CreateTripPage />} />
            <Route path="/trips/:id" element={<TripDetailsPage />} />
            <Route path="/maps" element={<MapsPage />} />
          </Route>
        </Routes>
      </main>

      {/* Global Floating Gemini AI Assistant Chatbot for Maps, Dashboard, Create Trip, etc. */}
      {!isTripDetailsPage && <AiChatDrawer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <AppLayout />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
