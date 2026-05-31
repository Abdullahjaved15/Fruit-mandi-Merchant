import express from 'express';
import upload from './middlewares/uploadMiddleware.js';

const app = express();

app.post('/test', upload.single('image'), (req, res) => {
    res.json({ message: 'Success', file: req.file });
});

// Add error handling middleware to catch multer errors
app.use((err, req, res, next) => {
    console.error("Express Error:", err);
    res.status(500).json({ error: err.message });
});

const PORT = 5001;
app.listen(PORT, async () => {
    console.log(`Test server running on port ${PORT}`);
    
    // Simulate upload
    try {
        const formData = new FormData();
        // Create a blob from base64
        const base64Data = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer], { type: 'image/png' });
        formData.append('image', blob, 'test.png');
        
        const response = await fetch(`http://localhost:${PORT}/test`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Test Error:", e);
    }
    process.exit(0);
});
