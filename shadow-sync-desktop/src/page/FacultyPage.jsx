import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ChatArea from "../components/ChatArea";

function FacultyPage() {
  const [messages, setMessages] = useState([]);
  const [peers, setPeers] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:3000");

    websocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'message':
          setMessages((prev) => [
            ...prev, 
            {
              sender: data.sender,
              content: data.content,
              timestamp: new Date().toISOString()
            }
          ]);
          break;
          
        case 'peerList':
          setPeers(data.peers);
          break;
          
        default:
          console.log('Unhandled message type:', data.type);
      }
    };

    websocket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    setWs(websocket);

    return () => websocket.close();
  }, []);

  const handleSendMessage = (message) => {
    if (message.trim() && ws) {
      ws.send(message);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'me',
          content: message,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <FileUpload onUpload={(e) => console.log(e.target.files[0])} />
            <FileList files={[]} />
          </div>
          <ChatArea 
            messages={messages.map(msg => ({
              ...msg,
              sender: msg.sender === 'me' ? 'You' : msg.sender
            }))} 
            peers={peers}
            onSendMessage={handleSendMessage} 
          />
        </div>
      </div>
    </Layout>
  );
}

export default FacultyPage;