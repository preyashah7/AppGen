import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import MyApps from './pages/MyApps.jsx';
import NewApp from './pages/NewApp.jsx';
import AppShell from './components/AppShell.jsx';
import { AppProvider } from './context/AppContext.jsx';
import Dashboard from './components/engine/Dashboard.jsx';
import EntityTable from './components/engine/EntityTable.jsx';
import ConfigEditor from './pages/ConfigEditor.jsx';
import NotificationsPage from './components/NotificationsPage.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans">
          <Toaster
            position="top-right"
            duration={3000}
            toastOptions={{
              className: 'rounded-2xl border border-border bg-white text-text-primary shadow-[0_16px_40px_rgba(15,23,42,0.12)]',
              success: {
                iconTheme: {
                  primary: '#2563eb',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/apps" element={<MyApps />} />
            <Route path="/apps/new" element={<NewApp />} />
            <Route path="/apps/:appId/*" element={<AppProvider><AppShell /></AppProvider>}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="entity/:entityName" element={<EntityTable />} />
              <Route path="config" element={<ConfigEditor />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;