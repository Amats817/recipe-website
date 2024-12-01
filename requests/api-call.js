// This file (api-call.js) handles all requests associated with themealdb api calls.

const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../database');

// Gets a random recipe with all its data
router.get('/api/random-recipe', async (req, res) => {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: 'Failed to fetch recipe' });
    }
});

// Looks up recipe with specific recipeId
router.post('/api/recipe-lookup', async(req,res) =>{
    const {recipeId} = req.body;
    try {
      const response = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
      );
      const data = await response.json();
      res.json(data);
  } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
  }
})

router.post('/api/search', async (req, res) => {
  const { search } = req.body;
  try {
      const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${search}` 
      );
      const data = await response.json();

      /*
        Debugging method to test how many recipes are returned. (It seems the max amount per-search is 25.)

        // Count the number of recipes returned
        const recipeCount = data.meals ? data.meals.length : 0;
        // Log the count of recipes
        console.log('Number of recipes found:', recipeCount);

      */

      res.json(data);
  } catch (error) {
      console.error('Error fetching recipe:', error);
      res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});


module.exports = router;