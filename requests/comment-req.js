// This file (api-call.js) handles all requests associated with themealdb api calls.

const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../database');

router.get('/comments/fetch', (req, res) => {
    const { recipeId } = req.query;
    db.all('SELECT commentId, username, comment, date FROM user_comments WHERE recipeId = ?', [recipeId], (err, rows) => {
        if (err) {
            console.error('Error querying database:', err.message);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.json(rows || []);
    });
});

router.post('/comments/add', (req, res) => {
    if(req.session || req.session.logged_in){
        // Get the current date
        const currentDate = new Date();

        // Extract the month, day, and year
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
        const day = String(currentDate.getDate()).padStart(2, '0');        // Add leading zero if needed
        const year = currentDate.getFullYear();

        // Format the date as mm/dd/yyyy
        const formattedDate = `${month}/${day}/${year}`;

        const { comment, recipeId } = req.body;
        db.run('INSERT INTO user_comments (recipeId, username, comment, date) VALUES (?, ?, ?, ?)', [recipeId, req.session.user.username, comment, formattedDate], function(err) {
            if (err) {
                console.error('Error inserting into database:', err.message);
                return res.status(500).send('Internal Server Error');
            }
            res.json({ redirect: '/html/signup_complete.html' });
        });
        
    }
    else{
        res.sendStatus(401);
    }   
});


module.exports = router;