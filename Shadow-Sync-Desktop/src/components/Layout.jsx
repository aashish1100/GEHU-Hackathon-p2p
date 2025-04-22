import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="content">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
