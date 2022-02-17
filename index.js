const express = require('express')
const cors = require('cors')
const app = express()
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000

// middle ware 

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dzdlp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("DhakaShop");
        const productCollection = database.collection("all_product");
        const userCollection = database.collection('users')
        const reviewCollection = database.collection('review')

        // console.log('Database connected successfully');

        app.post('/addService', async (req, res) => {
            const service = req.body;
            const result = await productCollection.insertOne(service);

            console.log(result);

            res.json(result)
        })

        app.post('/users', async (req, res) => {

            const users = req.body;
            const result = await userCollection.insertOne(users);
            res.json(result)
        })


        app.post('/addReview', async (req, res) => {
            const service = req.body;
            const result = await reviewCollection.insertOne(service);
            console.log(result);
            res.json(result)
        })





        // Update User ......... Upsert User 
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        // users add Admin role

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result)
        })


        // Get Methode 

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;

            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const service = await cursor.toArray();
            res.send(service);
        })




        app.get('/product', async (req, res) => {
            const cursor = productCollection.find({});
            const service = await cursor.toArray();
            res.send(service);
        })





    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello Backend Team project !')
})


app.listen(port, () => {
    console.log(` Listening on port ${port}`)
})