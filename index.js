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