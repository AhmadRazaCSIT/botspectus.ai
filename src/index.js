const express = require('express');
const cors = require('cors');
const pdf2json = require('pdf2json');
const apiRouter = require('./routes');
const dotenv = require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api", apiRouter);
app.get('/', (req, res) => {
    res.send('Welcome to the PDF Search API!');});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});