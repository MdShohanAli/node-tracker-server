const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

// middle ware 

app.use(cors())
app.use(express.json())

// route 


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbiocc2.mongodb.net/?retryWrites=true&w=majority`;

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
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        const noteCollection = client.db('note-tacker').collection('notes')
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        //http://localhost:5000/notes
        //get api to reads all notes 
        app.get('/notes', async (req, res) => {
            const q = req.query;
            console.log(q);

            const cursor = noteCollection.find({})
            const result = await cursor.toArray()
            res.send(result)



        })
        // create note api 
        //http://localhost:5000/note
        /* body {
           "user-name":"mahabub"
      }*/
        app.post('/note', async (req, res) => {
            const data = req.body;
            console.log(data);
            const result = await noteCollection.insertOne(data)

            res.send(result)
        })
        //update api
        //updates note taker 
        //http://localhost:5000/note/644bc48bf1958a918bc0bb85
        app.put('/note/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log('form update api ', data);

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    // userName: data.username
                    ...data
                },

            };
            const result = await noteCollection.updateOne(filter, updateDoc, options);

            console.log('form put method', id);
            res.send(result)

        })

        //delete api 
        //http://localhost:5000/note/644bc48bf1958a918bc0bb85
        app.delete("/note/:id", async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await noteCollection.deleteOne(filter);
            res.send(result);

        })

    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send(' node tracker server ')
})

app.listen(port, () => {
    console.log(' ', port);
})