const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { response } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.csyc5ob.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
        const serviceCollection = client.db('davidsBurger').collection('services');
        const reviewCollection = client.db('davidsBurger').collection('reviews');

        // Getting all services
        app.get('/services', async (req, res) => {
            let query = {};
            if (req.query.sort == 3) {
                const cursor = serviceCollection.find(query);
                const services = await cursor.limit(3).toArray();
                return res.send(services);
            }
            else {
                const cursor = serviceCollection.find(query);
                const services = await cursor.toArray();
                res.send(services);
            }
        })

        // Getting a specific service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        // Add Service
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
        })

        // Getting service wise review
        app.get('/reviews', async (req, res) => {
            let query = {};

            if (req.query?.email) {
                query = {
                    email: req.query?.email
                }
            }

            if (req.query?.id) {
                query = {
                    serviceId: req.query?.id
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
        })

        // Post a review
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        // Delete a review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { serviceId: (id) };
            console.log(query);
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally { }
}
run().catch(e => console.log(e))


app.get('/', (req, res) => {
    res.send("Burger Server running");
})

app.listen(port, () => {
    console.log(`listening to port ${port}`);
})