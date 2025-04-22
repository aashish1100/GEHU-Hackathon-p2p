import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    if (name && role) {
      setUserLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userLoggedIn, setUserLoggedIn, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};
