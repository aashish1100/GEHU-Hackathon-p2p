import React from 'react';
import Header from './Header';
import Footer from './Footer';
import SessionList from './SessionList';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-background-dark text-light font-sans">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 bg-background-gray border-r border-gray shadow-lg">
          <SessionList />
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-auto bg-background-dark">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Layout;
