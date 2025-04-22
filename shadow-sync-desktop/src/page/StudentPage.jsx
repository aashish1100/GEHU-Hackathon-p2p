import React, { useState } from "react";
import Layout from "../components/Layout";
import FileList from "../components/FileList";
import ChatArea from "../components/ChatArea";

function StudentPage() {
  const [messages, setMessages] = useState([
    { sender: "Prof. Sharma", text: "Welcome to the session!" },
    { sender: "You", text: "Hello, professor!" },
  ]);

  const receivedFiles = [
    { name: "lab_instructions.pdf" },
    { name: "assignment.docx" },
  ];

  const handleSendMessage = (message) => {
    const newMessage = { sender: "You", text: message };
    setMessages([...messages, newMessage]);
  };

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileList files={receivedFiles} />
          <ChatArea messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </Layout>
  );
}

export default StudentPage;
