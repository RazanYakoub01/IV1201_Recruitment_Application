import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

// Use CORS middleware before any routes are defined
app.use(cors());

// This middleware will allow the backend to parse incoming JSON request bodies
app.use(express.json());

// Endpoint to handle POST requests to /echo
app.post('/echo', (req, res) => {
  console.log("Request body:", req.body); // Log the incoming request body

  const { message } = req.body; // Extract message from the request body
  if (message) {
    // Respond with a JSON object
    res.json({ reply: `Backend received: ${message}` });
  } else {
    // If no message is sent, respond with an error
    res.status(400).json({ error: "No message provided" });
  }
});

// Test GET route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
