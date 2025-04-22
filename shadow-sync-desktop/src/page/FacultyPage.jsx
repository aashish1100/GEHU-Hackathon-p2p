import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ChatArea from "../components/ChatArea";

function FacultyPage() {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // WebSocket setup for receiving messages
    const websocket = new WebSocket("ws://localhost:3000"); // Server URL

    websocket.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    websocket.onmessage = (event) => {
      const incomingMessage = JSON.parse(event.data);
      if (incomingMessage) {
        setMessages((prevMessages) => [...prevMessages, incomingMessage]);
      }
    };

    websocket.onclose = () => {
      console.log("Disconnected from WebSocket server");
    };

    setWs(websocket);  // Store WebSocket instance

    // Cleanup WebSocket connection on component unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const handleSendMessage = (message) => {
    if (message.trim() && ws) {
      const newMessage = { sender: "You", text: message };
      ws.send(JSON.stringify(newMessage)); // Send message via WebSocket
      setMessages((prev) => [...prev, newMessage]); // Add message to state for immediate UI update
    }
  };

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <FileUpload onUpload={(e) => console.log(e.target.files[0])} />
            <FileList files={[]} /> {/* Update to handle file uploads if needed */}
          </div>
          <ChatArea messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </Layout>
  );
}

export default FacultyPage;
