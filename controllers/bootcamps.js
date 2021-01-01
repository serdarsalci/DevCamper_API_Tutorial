const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp');
const geocoder = require('../utils/geocoder');
const asyncHandler = require('../middleware/async.js');

// @description   Get all bootcamps
// @route         Get/api/v1/bootcamps
// @access        Public

// without the wrapper function
// exports.getBootcamps = async (req, res, next) => {
// 	try {
// 		const bootcamps = await Bootcamp.find();
// 		res.status(200).json({
// 			success: true,
// 			count: bootcamps.length,
// 			data: bootcamps,
// 		});
// 	} catch (error) {
// 		next(error);
// 	}
// };

// with the wrapper function
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;
	let queryStr = JSON.stringify(req.query);

	// Add $ sign in front of mongosse comparison query operator
	queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

	// parse it to object pass it to find
	query = Bootcamp.find(JSON.parse(queryStr));
	const bootcamps = await query;

	//const bootcamps = await Bootcamp.find();
	console.log(req.query);
	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});

// @description   Get single bootcamps
// @route         Get/api/v1/bootcamps/:id
// @access        Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id} formatted id`,
				404
			)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @description   Create bootcamps
// @route         POST/api/v1/bootcamps/
// @access        Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({
		success: true,
		data: bootcamp,
	});
});

// @description   Update bootcamp
// @route         PUT/api/v1/bootcamps/:id
// @access        Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id} formatted id`,
				404
			)
		);
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @description   Delete bootcamp
// @route         DELETE/api/v1/bootcamps/:id
// @access        Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id} formatted id`,
				404
			)
		);
	}
	res.status(200).json({ success: true, data: {} });
});

// @description  Get Bootcamps within a radius
// @route         GET/api/v1/bootcamps/radius/:zipcode/:distance
// @access        Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat/lng from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	// Calc radius using radians
	// Divide dist by radius of earth
	// radius of Earth =  3,963 mi /  6,378km

	const radius = distance / 3963;
	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
	});

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		data: bootcamps,
	});
});
