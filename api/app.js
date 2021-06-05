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

//##############################################################################
// ROUTE HANDLERS
//##############################################################################

//##############################################
// DOCUMENT ROUTES
//##############################################

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
});

/**
 * POST /docs
 * Purpose: Create a list.
 */
app.post('/docs', (req, res) => {
    // Create a new document and return it alongside the user's id.
    // The document information (fields) will be passed in via the JSON request body.

    let newDoc = new Document({
        title: req.body.title
    });

    newDoc.save().then((doc) => {
        // the full doc is returned (incl. id)
        res.send(doc);
    })
});

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
});

/**
 * DELETE /docs/:id
 * Purpose: Delete a document.
 */
app.delete('/docs/:id', (req, res) => {
    // Delete the specified document (with the id in the URL)
    Document.findOneAndRemove({ _id: req.params.id }).then((docToRemove) => {
        res.send(docToRemove);
    })
});


//##############################################
// SHAPE ROUTES
//##############################################

/**
 * GET /docs/:docId/tasks
 * Purpose: Get all shapes that belong to a specific document (specified by docId).
 */
app.get('/docs/:docId/shapes', (req, res) => {
    Shape.find({
        _docId: req.params.docId
    }).then((shapes) => {
        res.send(shapes);
    })
});

/**
 * POST /docs
 * Purpose: Create a new shape in a specific document (specified by docId).
 */
app.post('/docs/:docId/shapes', (req, res) => {
    let newShape = new Shape({
        _docId: req.params.docId,
        id: req.body.id,
        type: req.body.type,
        label: req.body.label,
        translateX: req.body.translateX,
        translateY: req.body.translateY,
        backgroundColor: req.body.backgroundColor,
        textColor: req.body.textColor,
        borderColor: req.body.borderColor,
    });

    newShape.save().then((doc) => {
        res.send(doc);
    })
});

/**
 * PATCH /docs/:docId/shapes/:shapeId
 * Purpose: Update an existing shape (specified by shapeId).
 */
app.patch('/docs/:docId/shapes/:shapeId', (req, res) => {
    Shape.findOneAndUpdate({
        _id: req.params.shapeId,
        _docId: req.params.docId
    }, {
        $set: req.body
    }
    ).then(() => {
        res.sendStatus(200);
    })
});

/**
 * DELETE /docs/:docId/shapes/:shapeId
 * Purpose: Delete a shape in a document.
 */
app.delete('/docs/:docId/shapes/:shapeId', (req, res) => {
    Shape.findOneAndRemove({
        _id: req.params.shapeId,
        _docId: req.params.docId
    }).then((shapeToRemove) => {
        res.send(shapeToRemove);
    })
});

app.listen(3001, () => {
    console.log(`Server is listening on port 3001...`);
})