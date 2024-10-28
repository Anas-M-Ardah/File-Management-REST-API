// app.js

const express = require("express");
const fileRoutes = require("./routes/files.js")

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', fileRoutes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
