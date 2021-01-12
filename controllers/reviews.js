const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/async.js');

// @description   Get Reviews
// @route         Get/api/v1/reviews
// @route         Get/api/v1/bootcamps/:bootcampId/reviews
// @access        Public
exports.getReviews = asyncHandler(async (req, res, next) => {
	console.log('getReviews hit');
	if (req.params.bootcampId) {
		const reviews = await Review.find({
			bootcamp: req.params.bootcampId,
		}).populate({
			path: 'user',
			select: 'name',
		});
		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews,
		});
	} else {
		console.log('get all reviews called');
		res.status(200).json(res.advancedResults);
		//	console.log(res.advancedResults);
	}
});

// @description   Get Logged in user Reviews
// @route         Get/api/v1/reviews/me
// @access        Private
exports.getMyReviews = asyncHandler(async (req, res, next) => {
	console.log('getMyReviews hit');
	const reviews = await Review.find({ user: req.user.id });
	return res.status(200).json({
		success: true,
		count: reviews.length,
		data: reviews,
	});
});

// @description   Get a single Review
// @route         Get/api/v1/reviews/:id
// @access        Public
exports.getReview = asyncHandler(async (req, res, next) => {
	console.log(req.params.id);
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

// @description  	Update a review
// @route         Put/api/v1/reviews/:id
// @access        Private
exports.updateReview = asyncHandler(async (req, res, next) => {
	let review = await Review.findById(req.params.id);

	//	console.log(JSON.stringify(req.user.id));
	//	console.log(review);

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
		);
	}
	// Make sure review belongs to user or user is admin
	console.log('req.user.id');
	//console.log(req.user.id);

	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new ErrorResponse('Not authorized to update review!', 401));
	}

	review = await Review.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: review,
	});
});

// @description  	DELETE a review
// @route         Delete/api/v1/reviews/:id
// @access        Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return next(
			new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
		);
	}
	// Make sure review belongs to user or user is admin
	console.log('req.user.id');
	//console.log(req.user.id);

	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(
			new ErrorResponse('Not authorized to delete this review!', 401)
		);
	}

	await review.remove();

	res.status(200).json({
		success: true,
		data: {},
	});
});
