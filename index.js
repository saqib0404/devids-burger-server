const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.csyc5ob.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// function run() {
//     try {

//     }
//     finally { }
// }
// run().catch(e => console.log(e))


app.get('/', (req, res) => {
    res.send("Burger Server running");
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})