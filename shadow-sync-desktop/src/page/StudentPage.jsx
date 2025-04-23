import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import FileList from "../components/FileList";
import ChatArea from "../components/ChatArea";

function StudentPage() {
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
          // Only add messages from others
          if (data.sender !== 'me') {
            setMessages((prev) => [
              ...prev, 
              {
                sender: data.sender,
                content: data.content,
                timestamp: new Date().toISOString()
              }
            ]);
          }
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
      // Add to local state immediately
      setMessages((prev) => [
        ...prev,
        {
          sender: 'me', // Mark as your message
          content: message,
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Send to server
      ws.send(message);
    }
  };

  const receivedFiles = [
    { name: "lab_instructions.pdf" },
    { name: "assignment.docx" },
  ];

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileList files={receivedFiles} />
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

export default StudentPage;