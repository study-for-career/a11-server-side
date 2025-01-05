require('dotenv').config()
const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express()
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8foj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Connect to mongodb
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection

        // Database collections
        const newUserCollection = client.db('learn_plus_db').collection('newUserCollection');
        const serviceCollection = client.db('learn_plus_db').collection('serviceCollection');
        const purchasedServices = client.db('learn_plus_db').collection('purchasedServices');

        app.get('/', (req, res) => {
            res.send('Assignment 11. Learn Plus Server Side')
        })

        // userinfo by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const result = await newUserCollection.findOne(query);
            res.send(result)
        })

        // Get services by id
        app.get('/services/:id', async (req, res) => {
            try {
                const id = req.params.id;
                console.log(id)
                const query = { _id: new ObjectId(id) }
                const result = await serviceCollection.findOne(query);
                res.send(result)
            }
            catch (err) {
                console.log(err)
                res.send({ message: 'Something went wrong' })
            }
        })

        // Get services by email
        app.get('/services_by_user/:email', async (req, res) => {
            const email = req.params.email;
            const query = { provider_email: email }
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })


        // Get all services
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray();
            res.send(result)
        })

        // Get purchased services from database by email
        app.get('/purchased_services/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user_email: email }
            const cursor = purchasedServices.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/service_todo/:email', async (req, res) => {
            const email = req.params.email;
            const query = { provider_email: email }
            const cursor = purchasedServices.find(query);
            const result = await cursor.toArray()
            res.send(result)
        })

        // Updata a service
        app.put('/update_service/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateData = {
                $set: {
                    title: data.title, service_area: data.service_area, price: data.price,
                    image: data.image, description: data.description
                }
            }

            const result = await serviceCollection.updateOne(query, updateData, options);
            res.send(result)
        })
        app.put('/service_todo/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body

            console.log(data)
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateData = {
                $set: {
                    serviceStatus: data.serviceStatus
                }
            }

            const result = await purchasedServices.updateOne(query, updateData, options);
            res.send(result)
        })

        // Store new user into database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await newUserCollection.insertOne(user)
            res.send(result)
        })

        // Store new service into database
        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        // Store purchased service into database
        app.post('/purchased_services', async (req, res) => {
            const purchasedService = req.body;
            const result = await purchasedServices.insertOne(purchasedService)
            res.send(result)
        })

        app.delete('/delete_service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            console.log(query)
            const result = await serviceCollection.deleteOne(query);
            res.send(result)
        })




        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log('server is running')
})