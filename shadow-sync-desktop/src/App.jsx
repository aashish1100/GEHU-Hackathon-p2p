// App.js
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './components/Login';
import FacultyPage from './page/FacultyPage';
import StudentPage from './page/StudentPage';

function AppRoutes() {
  const { userLoggedIn, userRole } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          userLoggedIn ? (
            userRole === 'Faculty' ? (
              <FacultyPage />
            ) : (
              <StudentPage />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
