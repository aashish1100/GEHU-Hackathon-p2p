import Layout from './components/Layout';
import FileSharing from './components/FileSharing';
import Messaging from './components/Messaging';
import SessionList from './components/SessionList';
import ChatArea from './components/ChatArea';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

export default function App() {
  return (
    <Layout>
      <SessionList />
      <ChatArea />
      <FileSharing />
      <FileUpload />
      <FileList />
      <Messaging />
    </Layout>
  );
}
