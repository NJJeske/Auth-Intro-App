const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

const db = require('../database/connection');
const users = db.get('users');

users.createIndex('username', { unique: true });

const router = express.Router();

const schema = Joi.object().keys({
    username: Joi.string().regex(/(^[a-zA-Z0-9_]+$)/).min(2).max(30).required(),
    password: Joi.string().trim().min(10).required()
})

router.get('/', (req, res) => {
    res.json({
        message: 'Lock'
    });
});


router.post('/signup', (req, res, next) => {
    const result = Joi.validate(req.body, schema);
    if (result.error === null) {
        users.findOne({
            username: req.body.username,
        }).then(user => {
            // if user is undefined, username is not in the db, otherwise duplicate username
            if (user) {
                // there is already a user in the db with this username...
                // respond with error!
                const error = new Error('Username has already been taken.');
                next(error); 
            } else {
                // hash password
                bcrypt.hash(req.body.password, 12, ).then(hashedPassword => {
                    
                // insert the user with the hashed password 
                    const newUser = {
                        username: req.body.username,
                        password: hashedPassword
                    };

                    users.insert(newUser).then(insertedUser => {
                        delete insertedUser.password;
                        res.json(insertedUser);
                    });
                });
            }
        });
    } else {
        next(result.error);
    }
    
});

module.exports = router;