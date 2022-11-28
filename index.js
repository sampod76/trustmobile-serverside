const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
// console.log(stripe);

const app = express()

app.use(express.json())
app.use(cors())




const port = process.env.POST || 5000;

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.9yhpi6m.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const userCollection = client.db('mobileBuySell').collection('users')
const mobilesCollection = client.db('mobileBuySell').collection('mobiles')
const bookingCollection = client.db('mobileBuySell').collection('booking')
const whitelistCollection = client.db('mobileBuySell').collection('whitelist')
const paymentsCollection = client.db('mobileBuySell').collection('payments')


// const run = async () => {
//     try {
//         await client.connect()
//         console.log('this client connect')
//     } catch (error) {
//         console.log(error.message);
//     }
// }
// run().catch(err => console.log(err.message))

app.post('/jwt', async (req, res) => {
    const email = req.body.email
    // console.log(email)
    try {
        const user = await userCollection.findOne({ email })
        // console.log(user);
        if (user) {
            const token = jwt.sign({ email }, process.env.JWT_TOKEN_KEY, { expiresIn: '30d' })
            // console.log(token);
            res.send({
                success: true,
                token
            })
        } else {
            res.send({
                success: false,
                message: `This ${email} not found`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})




// all users find get all 

app.get('/users', async (req, res) => {
    let filter = {}
    // console.log(req.headers.authorization)

    try {
        if (req.query.email) {
            filter = {
                email: req.query.email
            }
        }

        if (req.query.role) {
            filter = {
                role: req.query.role
            }
        }

        // console.log(filter);
        const result = await userCollection.find(filter).toArray()
        if (result.length > 0) {
            res.send({
                success: true,
                data: result
            })
        } else {
            res.send({
                success: false,
                message: 'No data found'
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.post('/users', async (req, res) => {
    const body = req.body
    try {
        // const result = await userCollection.insertOne(body)
        const result = await userCollection.insertOne(body)
        res.send({
            success: true,
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


app.put('/updateuser/:id', async (req, res) => {

    try {
        // ------------------------------------------------------
        // update data to all mobile collacton
        const filter = { _id: ObjectId(req.params.id) }

        const findUserDataAndUpdate = await userCollection.updateOne(filter, {
            $set: {
                verify: true
            }
        })

        // -------------------------------------------------------
        console.log(findUserDataAndUpdate)
        if (findUserDataAndUpdate.modifiedCount) {
            res.send({
                success: true,
                message: 'Successfull updates'
            })
        } else {
            res.send({
                success: false,
                message: 'do not update user '
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//Delete user by id
app.delete('/users/:id', async (req, res) => {
    try {

        const result = await userCollection.deleteOne({ _id: ObjectId(req.params.id) })

        if (result.deletedCount) {
            res.send({
                success: true,
                message: 'Deleted this users '
            })
        } else {
            res.send({
                success: false,
                message: 'Not Deleted this mobiles '
            })

        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})




//all mobile phone gate
app.get('/mobiles', async (req, res) => {
    let filter = {}
    // console.log(req.headers.authorization)
    try {
        if (req.query.catagori) {
            filter = {
                name: req.query.catagori
            }
        }
        if (req.query.email) {

            filter = {
                "sellarInfo.sellarEmail": req.query.email
                // "sellarInfo.sellarEmail": "sampodnath@gmail.com"
            }
        }

        // not work 
        if (req.query.ads) {
            console.log(req.query.ads)
            filter = {
                ads:req.query.ads   
            }
        }

        const result = await mobilesCollection.find(filter).toArray()

        res.send({
            success: true,
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


app.get('/mobiles/ads', async (req, res) => {
    let filter = {ads:true}
    console.log(req.headers.authorization )
    try {
      
        const result = await mobilesCollection.find(filter).toArray()

        res.send({
            success: true,
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})







// catagori single mobile 
app.get('/mobiles/:id', async (req, res) => {
    // console.log(req.params.id)
    try {
        const result = await mobilesCollection.findOne({ _id: ObjectId(req.params.id) })
        if (result._id) {
            res.send({
                success: true,
                data: result
            })
        } else {
            res.send({
                success: true,
                message: 'no booking found'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

// delete single mobile by id
app.delete('/mobiles/:id', async (req, res) => {
    try {

        const result = await mobilesCollection.deleteOne({ _id: ObjectId(req.params.id) })

        if (result.deletedCount) {
            res.send({
                success: true,
                message: 'Deleted this mobiles '
            })
        } else {
            res.send({
                success: false,
                message: 'Not Deleted this mobiles '
            })

        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

// creaite or post single mobile 
app.post('/mobiles', async (req, res) => {
    const bookingDos = req.body

    try {
        const result = await mobilesCollection.insertOne(bookingDos)
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Booking successfull ${result.insertedId}`
            })
        } else {
            res.send({
                success: false,
                message: `this not booking`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//update mobilee
app.put('/mobiles/:id', async (req, res) => {
    const datas = req.body
    // console.log(datas);
    try {
        const result = await mobilesCollection.updateOne({ _id: ObjectId(req.params.id) }, { $set: datas }, { upsert: true })

        if (result.modifiedCount) {
            res.send({
                success: true,
                message: 'Successfully mobile data update'
            })
        } else {
            res.send({
                success: false,
                message: 'data not update'
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//get booking 
app.get('/booking', async (req, res) => {
    const query = req.query.email
    try {
        const result = await bookingCollection.find({ useremail: query }).toArray()
        // console.log(result)
        res.send({
            success: true,
            data: result
        })
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//get booking 
app.get('/booking/:id', async (req, res) => {
    const id = req.params.id
    try {
        const result = await bookingCollection.findOne({ _id: ObjectId(id) })
        if (result._id) {
            res.send({
                success: true,
                data: result
            })
        } else {
            res.send({
                success: false,
                message: 'this item not booking'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})
// update booking 
app.patch('/booking/:id', async (req, res) => {
    const id = req.params.id
    try {
        const result = await bookingCollection.updateOne({ _id: ObjectId(id) }, { $set: { paid: true } })
        if (result.modifiedCount) {
            res.send({
                success: true,
                data: result
            })
        } else {
            res.send({
                success: false,
                message: 'this item not update booking'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

// booking callection 

app.post('/booking', async (req, res) => {
    const bookingDos = req.body

    try {
        const result = await bookingCollection.insertOne(bookingDos)
        if (result.insertedId) {
            res.send({
                success: true,
                message: `Booking successfull ${result.insertedId}`
            })
        } else {
            res.send({
                success: false,
                message: `this not booking`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//booking delete
app.delete('/booking/:id', async (req, res) => {
    const id = req.params.id
    try {
        const result = await bookingCollection.deleteOne({ _id: ObjectId(id) })
        if (result.deletedCount) {
            res.send({
                success: true,
                message: 'successfully delete'
            })
        } else {
            res.send({
                success: false,
                message: 'do not delete'
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

//whitelist get
app.get('/whitelist', async (req, res) => {
    const emails = req.query.email
    try {
        const result = await whitelistCollection.find({ useremail: emails }).toArray()
        res.send({
            success: true,
            data: result
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


// whitelist post
app.post('/whitelist', async (req, res) => {
    const whitelistDos = req.body
    try {
        const result = await whitelistCollection.insertOne(whitelistDos)
        if (result.insertedId) {
            res.send({
                success: true,
                message: `whitelist successfull ${result.insertedId}`
            })
        } else {
            res.send({
                success: false,
                message: `this not whitelist`
            })
        }

    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

// WhiteList delete 
app.delete('/whitelist/:id', async (req, res) => {
    const id = req.params.id
    try {
        const result = await whitelistCollection.deleteOne({ _id: ObjectId(id) })
        if (result.deletedCount) {
            res.send({
                success: true,
                message: 'successfully delete'
            })
        } else {
            res.send({
                success: false,
                message: 'do not delete'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})

app.put('/updateMobile', async (req, res) => {
    const data = req.body
    try {
        // ------------------------------------------------------
        // update data to all mobile collacton
        const filter = { _id: ObjectId(data.mobileId) }
        const option = { upsert: true }
        const findMobileData = await mobilesCollection.updateOne(filter, {
            $set: {
                stock: data.stock
            }
        }, option)

        // -------------------------------------------------------

        if (findMobileData.matchedCount) {
            res.send({
                success: true,
                message: 'Successfull updates'
            })
        } else {
            res.send({
                success: false,
                message: 'do not update '
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        })
    }
})


//create payment cli
app.post('/create-payment-intent', async (req, res) => {
    const booking = req.body
    const price = parseFloat(booking.price)
    const amount = price * 100
    // console.log(amount)
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        "payment_method_types": [
            "card"
        ],
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
    });
})

//payment post
app.post('/payments', async (req, res) => {
    const paymentData = req.body
    // const decodedEmial = req.decoded.email
    try {

        // get user data base 
        // const userEmail = await usersCollection.findOne({ email: decodedEmial })

        // if (userEmail.email !== decodedEmial) {
        //     return res.send({
        //         success: false,
        //         message: 'You are not correct person this is payment '
        //     })
        // }

        const result = await paymentsCollection.insertOne(paymentData)
        if (result.insertedId) {
            res.send({
                success: true,
                message: 'successfully data inside',
                insertedId: result.insertedId
            })
        } else {
            res.send({
                success: false,
                message: 'payment is not inside database'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message + ' error'
        })
    }
})
app.patch('/payments', async (req, res) => {
    const paymentData = req.body
    // const decodedEmial = req.decoded.email
    try {

        // get user data base 
        // const userEmail = await usersCollection.findOne({ email: decodedEmial })

        // if (userEmail.email !== decodedEmial) {
        //     return res.send({
        //         success: false,
        //         message: 'You are not correct person this is payment '
        //     })
        // }

        const result = paymentsCollection.updateOne(paymentData)
        if (result.matchedCount) {
            res.send({
                success: true,
                message: 'successfully data inside',
                insertedId: result.insertedId
            })
        } else {
            res.send({
                success: false,
                message: 'payment is not inside database'
            })
        }
    } catch (error) {
        res.send({
            success: false,
            message: error.message + ' error'
        })
    }
})






app.get('/', (req, res) => {
    res.send('this server runnitn')
})

app.listen(port, () => {
    console.log(`this is run servet ${port}`)
})