//load express.js
const express = require ('express');
const app = express ()

//parse the request parameters
app.use(express.json())

//connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://Luke:Password@cluster0.mj7ki.mongodb.net/Luke?retryWrites=true&w=majority', (err, client) => {
    db = client.db('webstore')
})

//get the MongoDB collection name
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName)
    return next()
})

// root path response
app.get('/', function (req, res) {
    res.send('Select a collection, e.g., /collection/messages')
})

// retrieve the collection with get
app.get('/collection/:collectionName', (req, res) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e)
        res.send(results)
        })
})

//retrieve an object by mongodb ID
const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne(
        {_id: new ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send(result)
        })
})

// add an object
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e)
        res.send(results.ops)
    })
})

// update an object by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        {_id: new ObjectID(req.params.id) },
        {$set: req.body },
        {safe: true, multi: false},
        (e, result) => {
            if (e) return next(e)
            res.send((result.return.n === 1) ?
                {msg: 'success'} : {msg: 'error'})
        })
})

//delete an object by ID
app.delete('/collection/:collectioName/:id', (req, res, next) => {
    req.collection.deleteOne(
        {_id: ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e)
            res.send((result.result.n === 1) ?
            {msg: 'success'} : {msg: 'error'})
        })
})

const port = process.env.PORT || 3000
app.listen(port);
console.log('server running on port' & port);
