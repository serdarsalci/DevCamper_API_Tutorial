const path = require('path');
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
	res.status(200).json(res.advancedResults);
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
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id} formatted id`,
				404
			)
		);
	}
	bootcamp.remove();
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

// @description   Upload photo for bootcamp
// @route         PUT/api/v1/bootcamps/:id/photo
// @access        Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);

	if (!bootcamp) {
		return next(
			new ErrorResponse(
				`Bootcamp not found with id of ${req.params.id} formatted id`,
				404
			)
		);
	}

	if (!req.files) {
		return next(new ErrorResponse(`Please upload a file`, 400));
	}

	const file = req.files.file;
	// Make sure image is photo
	if (!file.mimetype.startsWith(`image`)) {
		return next(new ErrorResponse(`Please upload an image file`), 400);
	}

	// Check file size
	if (file.size > process.env.MAX_FILE_UPLOAD) {
		return next(
			new ErrorResponse(
				`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
			),
			400
		);
	}

	//Create custom file name
	file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
	console.log(file.name);

	file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with photo upload.`), 500);
		}
		await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

		res.status(200).json({
			success: true,
			data: file.name,
		});
	});
});
