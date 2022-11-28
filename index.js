const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();
const jwt = require('jsonwebtoken');
const stripe = require("stripe")(process.env.STRIPE_SECRET);

//middle ware
const app= express();
app.use(cors());
app.use(express.json())


//mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pbaqirc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    //jwt token
    function verifyJwt (req,res, next){
        const authrazation = req.headers.authrazation;
        if(!authrazation){
            return res.status(401).send('unauthrazation acess')
        }
        const token = authrazation.split(' ')[1]
        jwt.verify(token, process.env.ACESS_TOKEN, function(err,decoded){
            if(err){
              return  res.status(401).send({message: 'forbian acess'})
            }
            req.decoded = decoded;
            next()
        })
    }
    

async function run(){
    try{
       
        const cetagoryColletion = client.db('watch-world').collection('cetagorys')
        const productsColletion = client.db('watch-world').collection('products')
        const paymentColletion = client.db('watch-world').collection('payment');

        const bookingColletion = client.db('watch-world').collection('booking')
        const userColletion = client.db('watch-world').collection('user')
        const addItemColletion = client.db('watch-world').collection('add-products');
        const adverticsColletion = client.db('watch-world').collection('adverrtics');

        //verfy admin
        const  verifyAdmin = async (req,res, next)=>{
        //console.log(req.decoded.email);
        const decodedEmail = req.decoded.email;
        const query = {email: decodedEmail};
        const user = await userColletion.findOne(query);
        if(user?.role !== 'admin'){
            res.status(403).send({message: 'forbian acess'})
        }
        next()
    }
     

        app.get('/cetagory', async (req,res)=>{
            const query = {}
            const result = await cetagoryColletion.find(query).toArray()
            res.send(result)
        })
        app.get('/cetagory/:categori_name', async (req,res)=>{
            const name = req.params.categori_name
            const query = {categori_name : name}
            const result = await productsColletion.find(query).toArray()
            res.send(result)
        })    


            app.post('/booking', async (req,res)=>{           
                const booking = req.body;
                const query = {
                    item : booking.item,
                    email: booking.email
                }      
               // console.log(query);      
                const alredybook = await bookingColletion.find(query).toArray();
                if(alredybook.length){
                    const message = `You are alredy booking ${booking.item}`
                    return res.send({acknowledged: false, message})
                }
                const result = await bookingColletion.insertOne(booking);                 
            res.send(result)
            })

        //get email booking
        app.get('/booking', async (req,res)=>{
            let email = req.query.email;
           // const decodeemail = req.decoded.email 

            // if( email !== decodeemail){
            //     return res.status(401).send({message: 'frbian acess'})
            // }

            const query = {email: email}
            //const query ={}
            const result = await bookingColletion.find(query).toArray()
            res.send(result)
        })

        app.get('/booking/:id', async (req,res)=>{
            const ids = req.params.id;
            const query = {_id: ObjectId(ids)}
            const result = await bookingColletion.findOne(query)
            res.send(result)
        });

        //adverrtics items
        app.post('/advertics',async(req,res)=>{
            const adver = req.body;
                const query = {
                    watch_name : adver.watch_name,
                    email: adver.email
                }           
                const alredybook = await adverticsColletion.find(query).toArray();
                if(alredybook.length){
                    const message = `You are alredy adverrtics ${adver.watch_name}`
                    return res.send({acknowledged: false, message})
                }
            const result = await adverticsColletion.insertOne(adver);                 
            res.send(result)
        })
       
        app.get('/advertics', async(req,res)=>{         
            const email =req.query.email;
            const query = {email: email}
            const result =await adverticsColletion.find(query).toArray();
            res.send(result)
        })

        //dele-adver
        app.delete('/products/:id', async (req,res)=>{
            const ids =req.params.id
            const query = {_id: ObjectId(ids)}
            const result = await productsColletion.deleteOne(query);
            res.send(result)
        })
        

        //add product
         app.post('/products', async (req,res)=>{
            const user = req.body;
            const result = await productsColletion.insertOne(user);
            res.send(result)
        });

     

        app.get('/products',async(req,res)=>{
           let email = req.query.useR;
            const query = {useR: email}
            //console.log(query);
            const result = await productsColletion.find(query).toArray()
            res.send(result)
        })
    

        app.get('/products/dress', async (req,res)=>{

            const filter = {categori_name: 'Dress'}
            const users = await productsColletion.find(filter).toArray()
            res.send(users)
        })

        app.get('/products/wood',  async (req,res)=>{
            const filter = {categori_name: 'Wood'}
            const users = await productsColletion.find(filter).toArray()
            res.send(users)
        })
        app.get('/products/sport',  async (req,res)=>{
            const filter = {categori_name: 'Sport'}
            const users = await productsColletion.find(filter).toArray()
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
            const updateResult = await productsColletion.updateOne(filter, updateDoc)
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
                    role: 'admin',
                    verify: 'verified'
                }
            }
            const result =await userColletion.updateOne(filter, updateDoc, option)
            res.send(result)
        })

        //isAdmin
        app.get('/users/admin/:email', async (req,res)=>{
            const email = req.params.email;
            const query = {email}
            const user = await userColletion.findOne(query)
            res.send({
                isAdmin: user?.role === 'admin',
                isVerify: user?.verify === 'verified'
            })
        });


        app.get('/users/seller/:email', async (req,res)=>{
            const email = req.params.email
            const query = {email}
            const user = await userColletion.findOne(query)
            res.send({ isSeller: user?.role === 'Seller' })
        });

        //jwt
        app.get('/jwt', async(req,res)=>{
            const email = req.query.email;         
            const query = {email: email}
            const user = await userColletion.findOne(query)
            if(user){
                const token = jwt.sign({email}, process.env.ACESS_TOKEN, {expiresIn: '6h'})
                return res.send({acessToken: token})
            }
             res.status(403).send({acessToken: ' '})

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