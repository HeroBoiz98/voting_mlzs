const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 1000;

app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public_columbus'));

// Load initial vote counts from columbus.json or initialize if the file doesn't exist
let voteCounts = {};
if (fs.existsSync('columbus.json')) {
    const jsonData = fs.readFileSync('columbus.json', 'utf8').trim();
    if (jsonData !== '') {
        try {
            voteCounts = JSON.parse(jsonData);
        } catch (error) {
            console.error('Error parsing JSON data:', error);
        }
    }
}

// Update the vote counts and write to columbus.json
function updateVoteCount(category, candidate) {
    if (!voteCounts[category]) {
        voteCounts[category] = {};
    }
    if (!voteCounts[category][candidate]) {
        voteCounts[category][candidate] = 0;
    }
    voteCounts[category][candidate]++;
    fs.writeFileSync('columbus.json', JSON.stringify(voteCounts));
}

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Incoming ${req.method} request to ${req.originalUrl}`);
    next();
});

// Vote endpoint
app.post('/vote', (req, res) => {
    const { category, candidate } = req.body;
    updateVoteCount(category, candidate);
    res.status(200).send('Vote submitted successfully!');
});

// Function to log server status every minute
function logServerStatus() {
    console.log(`[${new Date().toISOString()}] Server status:`);
    console.log(`  - Number of active connections: ${app.listenerCount('request')}`);
    console.log(`  - Current time: ${new Date().toLocaleString()}`);
}

// Log server status every minute
const interval = setInterval(logServerStatus, 60000);

// Stop logging server status when server is terminated
process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('Server terminated. Logging stopped.');
    process.exit(0);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    logServerStatus(); // Log initial server status
});
