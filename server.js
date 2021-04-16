const express = require('express')

const app = express()

const MongoClient = require('mongodb').MongoClient

const PORT = 3000

const mongo = require('mongodb')

// reuiring dot env to env variables
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'mortgage_calc'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })

app.set('view engine', 'ejs')

app.use(express.static('public'))

// does what body parser did
app.use(express.urlencoded({ extended: true }))

// send response as json format
app.use(express.json())


app.get('/', (request, response) => {
    // Access the home collection in mortgage_calc DB
    db.collection('home').find().toArray()
        .then(data => {
          console.log(data, 'the fish')
            // rendering data from data base to ejs
            response.render('index.ejs', { info: data })
        })
        .catch(error => console.error(error))
})

app.put('/addOneLike', (request, response) => {
    // looks in rappers collection for matching key value pairs in ascending order (time of creation "oldest one")
    db.collection('rappers').updateOne({ stageName: request.body.stageNameS, birthName: request.body.birthNameS, likes: request.body.likesS }, {
        // if it finds the fields it will updates with set
        $set: {
            likes: request.body.likesS + 1
        }
    }, {
        // sorting ids by descending order
        sort: { _id: -1 },
        upsert: false
    })
        .then(result => {
            console.log('Added One Like')
            // sends 'Like Added' to client
            response.json('Like Added')
        })
        .catch(error => console.error(error))

})

// listening to delete rapper
app.delete('/deleteMortgageCalculation', (request, response) => {
    // look up stage name in the db and delete them
    console.log(request.body, 'homdelteBody')
    console.log('This is the IDDDDDDDD' + new mongo.ObjectId(request.body.id))
    db.collection('home').deleteOne( {"_id": new mongo.ObjectId(request.body.id)})
        .then(result => {
            console.log('Home Calculation Deleted')
            response.json('Home Calculation Deleted')
        })
        .catch(error => console.error(error))
})

// CALCULATOR
// listening to delete rapper
app.post('/postMortgageCalculation', (request, response) => {
  const p = +request.body.loanAmount; //principle / initial amount borrowed
  const i = +request.body.interestRate / 100 / 12; //monthly interest rate
  const n = +request.body.years * 12; //number of payments months
  console.log({p, i, n})
  //monthly mortgage payment
  const m = Math.round(p * i * (Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1));
    db.collection('home').insertOne({
      ...request.body,
      total: m
    })
        .then(result => {
            console.log('Morgate Calculated')
            response.redirect('/')
        })
        .catch(error => console.error(error))
    response.redirect('/')
})

// process.env.PORT is for hosting otherwise its PORT 2121
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
