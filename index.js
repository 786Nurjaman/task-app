const express = require('express');
const routes = require('./routes/index');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const port = 7001;
const app = express();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow', '*')
    res.setHeader('Access-Control-Methods', 'GET, PUT, POST, DELETE')
    res.setHeader('Access-Control-Headers', 'Content-Type, Authorization')
    next()
})

app.use('/', routes)

mongoose.connect('mongodb://localhost:27017/taskdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    console.log("Database Connected"),
    app.listen(port, () => {
        console.log("Sever is running...!!");
    })
).catch(err =>{
    console.log(err)
})
