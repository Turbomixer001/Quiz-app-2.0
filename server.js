const express = require('express');
const compression = require('compression');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());

// Enable compression
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
});
