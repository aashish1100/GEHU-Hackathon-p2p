import React, { useState } from "react";
import Layout from "../components/Layout";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import ChatArea from "../components/ChatArea";

function FacultyPage() {
  const [messages, setMessages] = useState([
    { sender: "Prof. Sharma", text: "Please download the starter code." },
    { sender: "Student1", text: "Received, thanks!" },
    { sender: "You", text: "Sure, I am on it!" },
  ]);

  const mockFiles = [
    { name: "starter_code.zip" },
    { name: "dataset.csv" },
    { name: "readme.txt" },
  ];

  const handleSendMessage = (message) => {
    const newMessage = { sender: "You", text: message };
    setMessages([...messages, newMessage]);
  };

  return (
    <Layout>
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <FileUpload onUpload={(e) => console.log(e.target.files[0])} />
            <FileList files={mockFiles} />
          </div>
          <ChatArea messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </Layout>
  );
}

export default FacultyPage;
