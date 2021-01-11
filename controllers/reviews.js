const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async.js');

// @description   Get Reviews
// @route         Get/api/v1/reviews
// @route         Get/api/v1/bootcamps/:bootcampId/reviews
// @access        Public
exports.getReviews = asyncHandler(async (req, res, next) => {
	if (req.params.bootcampId) {
		const reviews = await Review.find({ bootcamp: req.params.bootcampId });
		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// @description   Get a single Review
// @route         Get/api/v1/reviews/:id
// @access        Public
exports.getReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id)
		.populate({
			path: 'bootcamp',
			select: 'name description',
		})
		.populate({
			path: 'user',
			select: 'name role',
		});

	if (!review) {
		return next(
			new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
		);
	}

	res.status(200).json({
		success: true,
		data: review,
	});
});

// @description  	Add review
// @route         Post/api/v1/bootcamps/:bootcampId/review
// @access        Private
exports.addReview = asyncHandler(async (req, res, next) => {
	req.body.bootcamp = req.params.bootcampId;
	req.body.user = req.user.id;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`No bootcamp with the id of ${req.params.bootcampId}`,
				404
			)
		);
	}

	const review = await Review.create(req.body);

	res.status(201).json({
		success: true,
		data: review,
	});
});
