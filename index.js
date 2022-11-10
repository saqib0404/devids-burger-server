const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        // JWT Token
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        })

        // JWT Verifier
        function verifyJwt(req, res, next) {
            const authHeader = req.headers.authorization;
            // console.log(authHeader);
            if (!authHeader) {
                return res.status(402).send({ message: 'unauthorized access' });
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
                if (err) {
                    return res.status(401).send({ message: 'unauthorized access' });
                }
                req.decoded = decoded;
                next();
            })
        }

        // Getting service wise review
        app.get('/reviews', verifyJwt, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'Forbidden access' });
            }

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

        // Update Review
        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.newReviewText;
            const query = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    reviewText: status
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        // Delete a review
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
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