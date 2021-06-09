const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// JWT Secret
const jwtSecret = 'P&Y9hJNP9Em^G!Eg^7wrnEDuDn!t+tu&WMb+bv4JJQbXA2bu92!^mzSC^%yFM@P-kZKwrscHnw-9^nd-bAh2qyh3?XwKX?c@U5_q';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    // Session objects contain a refresh token and its
    // expiry DateTime (in the form of a UNIX timestamp)
    sessions: [{
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

//##############################################################################
// INSTANCE METHODS
//##############################################################################

// modify the toJSON method so as to prevent the
// sessions and password from being returned
UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();

    // return everything but the password and sessions
    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = function () {
    const user = this;
    return new Promise((resolve, reject) => {
        // Create the JWT and return it.
        jwt.sign({ _id: user._id.toHexString() },
            jwtSecret,
            { expiresIn: "10s" },
            (err, token) => {
                if (!err) {
                    resolve(token);
                } else {
                    reject();
                }
            })
    })
}

/**
 * This method generates a 64byte hex string.
 * It does not save it in the database.
 * saveSessionToDatabase() does that.
 * 
 * @returns
 *     A refresh token. It is used to generate a new JWT.
 */
UserSchema.methods.generateRefreshAuthToken = function () {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buff) => {
            if (!err) {
                let token = buff.toString('hex');
                return resolve(token);
            }
        })
    })
}

// Session = Refresh Token + Expiry time
UserSchema.methods.createSession = function () {
    let user = this;

    return user.generateRefreshAuthToken()
        .then((refreshToken) => {
            return saveSessionToDatabase(user, refreshToken);
        }).then((refreshToken) => {
            // saved to DB
            // now return the refresh token
            return refreshToken;
        }).catch((err) => {
            return Promise.reject('Failed to save session to database.\n' + err);
        })
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;

    return expiresAt <= secondsSinceEpoch;
}


//##############################################################################
// MIDDLEWARE
//##############################################################################

// Before a user is saved, hash their password.
UserSchema.pre('save', function (next) {
    let user = this;

    // used by bcrypt to determine
    // the hashing rounds, i.e. a rough representation
    // of how long it'll take to hash a password
    let costFactor = 10;

    if (user.isModified('password')) {
        // generate salt and hash
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    } else {
        next();
    }
});


//##############################################################################
// MODEL METHODS
//##############################################################################

UserSchema.statics.getJWTSecret = () => { return jwtSecret; }

UserSchema.statics.findByIdAndToken = function (_id, token) {
    const User = this;

    return User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                }
                else {
                    reject();
                }
            })
        })
    })
}

//##############################################################################
// HELPER METHODS
//##############################################################################

let saveSessionToDatabase = (user, refreshToken) => {
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();

        user.sessions.push({
            'token': refreshToken,
            expiresAt
        });

        user.save().then(() => {
            // saved session successfully
            return resolve(refreshToken);
        }).catch((err) => {
            reject(err);
        });
    })
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = (daysUntilExpire * 24) * 3600;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User };
