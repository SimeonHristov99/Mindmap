const express = require('express');
const app = express();


const { mongoose } = require('./db/mongoose');

const bodyParser = require('body-parser');

// Load in the mongoose models.
const { Document, Shape, User } = require('./db/models');
const jwt = require('jsonwebtoken');

//##############################################################################
// MIDDLEWARE
//##############################################################################

app.use(bodyParser.json());

//##############################################
// CORS Headers
//##############################################

app.use(function (req, res, next) { // Copied from https://enable-cors.org/server_expressjs.html
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
    next();
});

// check whether a request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // JWT is invalid
            // => DO NOT AUTHENTICATE
            res.status(401).send(err);
        } else {
            req.user_id = decoded._id;
            next();
        }
    });
}

//##############################################
// Verify Refresh Token (verify the session)
//##############################################

let verifySession = (req, res, next) => {
    let refreshToken = req.header('x-refresh-token');
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        if (!user) {
            return Promise.reject({
                'error': 'User not found. Make sure the refresh token and the user id are correct.'
            });
        }

        // session is valid
        // => refresh token exists in db
        // => check if it has expired

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (
                session.token === refreshToken
                && User.hasRefreshTokenExpired(session.expiresAt) === false
            ) { // refresh token is valid
                isSessionValid = true;
            }
        });

        if (isSessionValid) {
            next();
        } else {
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid.'
            })
        }
    }).catch((err) => { // unauthorized
        res.status(401).send(err);
    })
};

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
app.get('/docs', authenticate, (req, res) => {
    // Return an array of all the documents in the database
    // that belong to the authenticated user.
    Document.find({
        _userId: req.user_id
    }).then((docs) => {
        res.send(docs);
    }).catch((err) => {
        res.send(err);
    })
});

/**
 * POST /docs
 * Purpose: Create a list.
 */
app.post('/docs', authenticate, (req, res) => {
    // Create a new document and return it alongside the user's id.
    // The document information (fields) will
    // be passed in via the JSON request body.

    let newDoc = new Document({
        title: req.body.title,
        _userId: req.user_id
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
app.patch('/docs/:id', authenticate, (req, res) => {
    // Update the specified document (with the id in the URL) with
    // the new values specified in the JSON body of the request.
    Document.findOneAndUpdate({
        _id: req.params.id,
        _userId: req.user_id
    }, {
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
app.delete('/docs/:id', authenticate, (req, res) => {
    // Delete the specified document (with the id in the URL)
    Document.findOneAndRemove({
        _id: req.params.id,
        _userId: req.user_id
    }).then((docToRemove) => {
        res.send(docToRemove);

        // delete all the shapes in the to be deleted document
        deleteShapesFromDocument(docToRemove._id);
    })
});


//##############################################
// SHAPE ROUTES
//##############################################

/**
 * GET /docs/:docId/tasks
 * Purpose: Get all shapes that belong
 * to a specific document (specified by docId).
 */
app.get('/docs/:docId/shapes', authenticate, (req, res) => {
    Shape.find({
        _docId: req.params.docId
    }).then((shapes) => {
        res.send(shapes);
    })
});



// Sharing will happen here I suppose.
/**
 * POST /docs
 * Purpose: Create a new shape in a specific document (specified by docId).
 */
app.post('/docs/:docId/shapes', authenticate, (req, res) => {
    Document.findOne({
        _id: req.params.docId,
        _userId: req.user_id
    }).then((user) => {
        if (user) {
            return true;
        }
        return false;
    }).then((canCreateShapes) => {
        if (canCreateShapes) {

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
        } else {
            res.sendStatus(404); // Not found.
        }
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
        res.sendStatus({ message: 'Updated successfully.' });
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


//##############################################
// USER ROUTES
//##############################################

/**
 * POST /users
 * Purpose: Sign up / Create a user.
 */
app.post('/users', (req, res) => {
    let body = req.body;
    let newUser = new User(body);

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created. Refresh token returned.
        // Generate an access auth token for the user.
        return newUser.generateAccessAuthToken()
            .then((accessToken) => {
                return { accessToken, refreshToken };
            });
    }).then((authTokens) => {
        res
            .header('x-access-token', authTokens.accessToken)
            .header('x-refresh-token', authTokens.refreshToken)
            .send(newUser);
    }).catch((err) => {
        res.status(400).send(err);
    })
});

/**
 * POST /users/login
 * Purpose: Log in.
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {

            return user.generateAccessAuthToken().then((accToken) => {
                return { accToken, refreshToken };
            });
        }).then((authTokens) => {
            res
                .header('x-access-token', authTokens.accToken)
                .header('x-refresh-token', authTokens.refreshToken)
                .send(user);
        });
    }).catch((err) => {
        res.status(400).send(err);
    })
});

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // if verifySession passes then
    // the user/caller is authenticated
    // the user_id is available
    // the user object is available
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((err) => {
        res.status(400).send(err);
    });

});



//##############################################################################
// HELPER METHODS
//##############################################################################

let deleteShapesFromDocument = (_docId) => {
    Shape.deleteMany({
        _docId
    });
}




app.listen(3001, () => {
    console.log(`Server is listening on port 3001...`);
})