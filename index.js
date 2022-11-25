const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

//middle ware
const app= express();
app.use(cors());
app.use(express.json())


//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pbaqirc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const dressColletion = client.db('watch-world').collection('dress')
        const sportColletion = client.db('watch-world').collection('sport-watch')
        const woodColletion = client.db('watch-world').collection('wood-watch')
        const buyerColletion = client.db('watch-world').collection('buyers')
        const sellerColletion = client.db('watch-world').collection('seller')
        const bookingColletion = client.db('watch-world').collection('booking')

        //dress-watch
        app.get('/dress-watch', async (req,res)=>{
            const query = {}
            const result = await dressColletion.find(query).limit(1).toArray()
            res.send(result)
        })
        app.get('/dress-watchs', async (req,res)=>{
            const query = {}
            const result = await dressColletion.find(query).toArray()
            res.send(result)
        })

        //sport-watch
        app.get('/sport-watch', async (req,res)=>{
            const query = {}
            const result = await sportColletion.find(query).limit(1).toArray()
            res.send(result)
        })
        app.get('/sport-watchs', async (req,res)=>{
            const query = {}
            const result = await sportColletion.find(query).toArray()
            res.send(result)
        })

        //wood-watch
        app.get('/wood-watch', async (req,res)=>{
            const query = {}
            const result = await woodColletion.find(query).limit(1).toArray()
            res.send(result)
        })
        app.get('/wood-watchs', async (req,res)=>{
            const query = {}
            const result = await woodColletion.find(query).toArray()
            res.send(result)
        })

        //buyer
        app.post('/buyers', async(req,res)=>{
            const query = req.body;
            const result = await buyerColletion.insertOne(query)
            res.send(result)
        })

        app.get('/buyers', async(req,res)=>{
            const query = {};
            const result = await buyerColletion.find(query).toArray()
            res.send(result)
        })
        //seller
        app.post('/seller', async(req,res)=>{
            const query = req.body;
            const result = await sellerColletion.insertOne(query)
            res.send(result)
        })

        app.get('/seller', async(req,res)=>{
            const query = req.body;
            const result = await sellerColletion.find(query).toArray()
            res.send(result)
        })

        //booking
        app.post('/booking',async(req,res)=>{
            const query = req.body;
            const result = await bookingColletion.insertOne(query)
            res.send(result)
        });

        app.get('/booking',async(req,res)=>{
            const query = {};
            const result = await bookingColletion.find(query).toArray()
            res.send(result)
        })

       
        

    }
    finally{

    }
}
 run().catch(err=>console.log(err))


app.get('/', (req,res)=>{
    res.send('server is running..!')
})

app.listen(port,()=>{
    console.log(`server running ${port}`);
})