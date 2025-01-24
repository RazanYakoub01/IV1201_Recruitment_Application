import { createRoot } from "react-dom/client";
import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");
  const [inputValue, setInputValue] = useState("");

  const sendRequest = () => {
    fetch("http://localhost:5000/echo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: inputValue }), // Send the input value
    })
      .then((response) => {
        console.log("Response status:", response.status); // Log the status
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON response
      })
      .then((data) => setMessage(data.reply)) // Set the received reply
      .catch((error) => setMessage("Error: " + error.message)); // Display errors
  };

  return (
    <div>
      <h1>{message || "Loading..."}</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Enter a message"
      />
      <button onClick={sendRequest}>Send to Backend</button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
