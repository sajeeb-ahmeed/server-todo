const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 7000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = "mongodb+srv://admin:admin@cluster0.nyfwt.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log(uri);
        const inventoryCollection = client.db('taskitem').collection('task');
        console.log('db connected');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })




        //todo API
        app.get('/add', async (req, res) => {
            const cursor = inventoryCollection.find()
            const services = await cursor.toArray();
            res.send(services)
        });


        //ITEM DELETE API
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });
        //ADD ITEM API
        app.post('/add', async (req, res) => {
            const newItem = req.body;
            const result = await inventoryCollection.insertOne(newItem);
            res.send(result);
        });

        // JWT API


        app.get('/add', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventoryCollection.find(query);
                const addItems = await cursor.toArray();
                res.send(addItems)
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        })

    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running MEDERNA Server');
});


app.listen(port, () => {
    console.log('Listening to port', port);
})