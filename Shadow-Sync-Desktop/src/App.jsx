import Header from './components/Header';
import FileSharing from './components/FileSharing';
import Messaging from './components/Messaging';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

export default function App() {
  return (
    <div className="min-h-screen bg-background-dark text-text-light">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-8">
          <FileSharing />
          <Messaging />
        </main>
        <Footer />
      </div>
    </div>
  );
}
