const express = require('express');
const app = express();


const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in the mongoose models.
const { Document, Shape } = require('./db/models');

// Load middleware
app.use(bodyParser.json());

// CORS HEADERS MIDDLEWARE
app.use(function (req, res, next) { // Copied from https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* ROUTE HANDLERS */

/* LIST ROUTES */

/**
 * GET /docs
 * Purpose: Get all documents.
 */
app.get('/docs', (req, res) => {
    // Return an array of all the documents in the database.
    Document.find().then((docs) => {
        res.send(docs);
    }).catch((err) => {
        res.send(err);
    })
})

/**
 * POST /docs
 * Purpose: Create a list.
 */
app.post('/docs', (req, res) => {
    // Create a new document and return it alongside the user's id.
    // The document information (fields) will be passed in via the JSON request body.
    let title = req.body.title;

    let newDoc = new Document({
        title
    });
    newDoc.save().then((doc) => {
        // the full doc is returned (incl. id)
        res.send(doc);
    })
})

/**
 * PATCH /docs/:id
 * Purpose: Update a specified document.
 */
app.patch('/docs/:id', (req, res) => {
    // Update the specified document (with the id in the URL) with the new values specified in the JSON body of the request.
    Document.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body // update the document using the body of the request.
    }).then(() => {
        res.sendStatus(200);
    }).catch((err) => {
        console.log(err);
    });
})

/**
 * DELETE /docs/:id
 * Purpose: Delete a document.
 */
app.delete('/docs/:id', (req, res) => {
    // Delete the specified document (with the id in the URL)
    Document.findOneAndRemove({ _id: req.params.id }).then((docToRemove) => {
        res.send(docToRemove);
    })
})

app.listen(3001, () => {
    console.log(`Server is listening on port 3001...`);
})