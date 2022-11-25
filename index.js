const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);

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
        const paymentColletion = client.db('watch-world').collection('payment')
        const userColletion = client.db('watch-world').collection('user')

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

        app.get('/booking/:id',async (req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)}
            const result = await bookingColletion.findOne(query)
            res.send(result)
        })

        app.post('/create-payment-intent',async (req,res)=>{
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentInten = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                  ]
            });
            res.send({
                clientSecret: paymentInten.client_secret,
              });
        })

        app.post('/payments', async(req,res)=>{
            const payment = req.body;
            const result = await paymentColletion.insertOne(payment);
            const id = payment.bookingId;
            const filter = {_id: ObjectId(id)}
            const updateDoc ={
                $set :{
                    paid: true,
                    transId: payment.transId,
                }
            }
            const updateResult = await bookingColletion.updateOne(filter, updateDoc)
            res.send(result)
        })

        //user
        app.post('/users', async (req,res)=>{
            const user = req.body;
            const result = await userColletion.insertOne(user);
            res.send(result)
        });

        app.get('/users', async (req,res)=>{
            const query = {}
            const users = await userColletion.find(query).toArray()
            res.send(users)
        })

        app.delete('/users/:id', async (req,res)=>{
            const ids =req.params.id
            const query = {_id: ObjectId(ids)}
            const result = await userColletion.deleteOne(query);
            res.send(result)
        })
        //admin user   
        app.put('/users/admin/:id', async (req,res)=>{          
            const ids = req.params.id;
            const filter = {_id: ObjectId(ids)}
            const option = {upsert: true}
            const updateDoc= {
                $set:{
                    role: 'admin'
                }
            }
            const result =await userColletion.updateOne(filter, updateDoc, option)
            res.send(result)
        })

       app.get('/users/admin/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await userColletion.findOne(query)
            res.send({isAdmin: user?.role === 'admin'})
        });

        

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