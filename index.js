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
       
        const bookingColletion = client.db('watch-world').collection('booking')
        const paymentColletion = client.db('watch-world').collection('payment')
        const userColletion = client.db('watch-world').collection('user')
        const addItemColletion = client.db('watch-world').collection('add-products');

        const cetagoryColletion = client.db('watch-world').collection('cetagorys')
        const productsColletion = client.db('watch-world').collection('products')

        app.get('/cetagory', async (req,res)=>{
            const query = {}
            const result = await cetagoryColletion.find(query).toArray()
            res.send(result)
        })
        app.get('/cetagory/:id', async (req,res)=>{
            const ids = req.params.id
            const query = {ceta_id: ids}
            const result = await productsColletion.find(query).toArray()
            res.send(result)
        })    

        //booking
        app.post('/booking',async(req,res)=>{
            const query = req.body;
            const result = await bookingColletion.insertOne(query)
            res.send(result)
        });

        //get email booking
        app.get('/booking',async(req,res)=>{
            let email = req.query.email;
            const query = {email: email}
            const result = await bookingColletion.find(query).toArray()
            res.send(result)
        })

        app.get('/booking/:id',async (req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)}
            const result = await bookingColletion.findOne(query)
            res.send(result)
        })


        

        app.post('/add-products', async (req,res)=>{
            const user = req.body;
            const result = await addItemColletion.insertOne(user);
            res.send(result)
        });

        app.get('/add-products', async (req,res)=>{
            const query = {}
            const users = await addItemColletion.find(query).toArray()
            res.send(users)
        })

        //payment
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

        app.get('/users/buyers',async(req,res)=>{
            const filter = {role: 'Buyer'}
            const result = await userColletion.find(filter).toArray()
            res.send(result)
        })

        app.get('/users/sellers',async(req,res)=>{
            const filter = {role: 'Seller'}
            const result = await userColletion.find(filter).toArray()
            res.send(result)
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