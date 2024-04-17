const express = require('express');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin to connect
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.get('/', (req, res) => {
    // get date for today
    const today = new Date();
    res.send(today.toDateString());
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

