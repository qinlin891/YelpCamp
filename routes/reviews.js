//Require necessary modules
const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground')
const Review = require('../models/review');
const reviews = require('../controllers/reviews')
const catchAsync = require('../utils/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');

//add new review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

//delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor,catchAsync(reviews.deleteReview));

module.exports = router;