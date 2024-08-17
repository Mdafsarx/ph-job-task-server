const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 1000;


app.use(cors());
app.use(express.json())
app.use(cookieParser());
// middleWare
app.use(
    cors({
      origin: [
        "http://localhost:5173",
      ],
      credentials: true
    })
  );




const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" ? true : false,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}
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
        const Users = client.db("PaygunDB").collection('Users');

        // token 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN);
            res.send({ token })
          })


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
        
        app.get('/users',async(req,res)=>{
          const result= await Users.find().toArray();
          res.send(result);
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