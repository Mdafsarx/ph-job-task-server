const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const bcrypt = require('bcryptjs');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 1000;

app.use(cors());
app.use(express.json())



app.get('/', (req, res) => {
    res.send('The server in running')
})
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PAS}@cluster0.zgmhkd0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
        // // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });

        // data-base
        const Users = client.db("PaygunDB").collection('Users')


        // reg api
        app.post('/Register', async (req, res) => {
            const hashedPassword = await bcrypt.hash(req.body.pin, 10);
            const { name, email, number, pin, role, status } = req.body
            const User = { name, email, number, pin: hashedPassword, role, status }
            const result = await Users.insertOne(User);
            res.send(result)
        })

        // login api
        app.post('/Login', async (req, res) => {

            const email = await Users.findOne({ email: req.body.user });
            const number = await Users.findOne({ number: req.body.user });

            if (!email && !number) {
                return res.send({ message: 'Invalid' });
            }

            else if (email) {
                const isMatch = await bcrypt.compare(req.body.pin, email.pin);
                if (isMatch) {
                    res.send({ message: 'Login successful' });
                } else {
                    res.send({ message: 'Invalid credentials' });
                }
            }

            else if (number) {
                const isMatch = await bcrypt.compare(req.body.pin, number.pin);
                if (isMatch) {
                    res.send({ message: 'Login successful' });
                } else {
                    res.send({ message: 'Invalid credentials' });
                }
            }

        })





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}






run().catch(console.dir);
app.listen(port, () => {
    console.log('running')
})