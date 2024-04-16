const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    // get date for today
    const today = new Date();
    res.send(`Hello World! Today is ${today.toDateString()}`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
