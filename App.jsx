import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

// Connect React frontend to Node.js backend
const socket = io("http://localhost:5000");

function App() {
  const [title, setTitle] = useState("Untitled Document");
  const [content, setContent] = useState("");
  const [online, setOnline] = useState(false);

  useEffect(() => {

    // Check when the user connects to the server
    socket.on("connect", () => {
      console.log("Connected to backend");

      setOnline(true);

      // Join the shared document room
      socket.emit("join-document", "document-1");
    });

    // Check when the user disconnects
    socket.on("disconnect", () => {
      console.log("Disconnected from backend");

      setOnline(false);
    });

    // Load the saved document from MongoDB
    fetch("http://localhost:5000/load-document")
      .then((response) => response.json())
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
      })
      .catch((error) => {
        console.log("Error loading document:", error);
      });

    // Receive document changes from other users
    socket.on("receive-change", (newContent) => {
      setContent(newContent);
    });

    // Remove Socket.IO listeners when component is closed
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive-change");
    };

  }, []);

  // Handle changes made inside the document editor
  const handleContentChange = (e) => {
    const newContent = e.target.value;

    setContent(newContent);

    // Send changes to other connected users
    socket.emit("document-change", {
      documentId: "document-1",
      content: newContent,
    });
  };

  // Save document to MongoDB
  const saveDocument = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/save-document",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            title: title,
            content: content,
          }),
        }
      );

      const data = await response.json();

      alert(data.message);

    } catch (error) {
      console.log(error);

      alert("Error saving document");
    }
  };

  // Create a new empty document
  const createNewDocument = () => {
    const confirmNew = window.confirm(
      "Create a new document?"
    );

    if (confirmNew) {
      setTitle("Untitled Document");
      setContent("");
    }
  };

  return (
    <div className="app">

      {/* Header */}
      <header className="header">

        {/* Application logo */}
        <div className="logo">
          📝 CollabDocs
        </div>

        {/* Document title */}
        <input
          className="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Online / Offline status */}
        <div className="status">
          <span
            className={online ? "online" : "offline"}
          >
            ●
          </span>

          {online ? " Online" : " Offline"}
        </div>

        {/* Save button */}
        <button
          className="save-button"
          onClick={saveDocument}
        >
          Save
        </button>

        {/* New document button */}
        <button
          className="new-button"
          onClick={createNewDocument}
        >
          + New
        </button>

      </header>

      {/* Editor area */}
      <main className="editor-container">

        {/* Toolbar */}
        <div className="toolbar">

          <button title="Bold">
            <b>B</b>
          </button>

          <button title="Italic">
            <i>I</i>
          </button>

          <button title="Underline">
            <u>U</u>
          </button>

          <button title="Align Center">
            ↔
          </button>

          <button title="List">
            ☰
          </button>

        </div>

        {/* Document editor */}
        <textarea
          className="editor"
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing your document..."
        />

      </main>

      {/* Footer */}
      <footer>
        🟢 Real-Time Collaboration
      </footer>

    </div>
  );
}

export default App;