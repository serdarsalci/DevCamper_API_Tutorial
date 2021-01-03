const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async.js');
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// @description   Get courses
// @route         Get/api/v1/courses
// @route         Get/api/v1/bootcamps/:bootcampId/courses
// @access        Public

exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;

	if (req.params.bootcampId) {
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		query = Course.find().populate({
			path: 'bootcamp',
			select: 'name description',
		});
	}
	const courses = await query;

	res.status(200).json({
		status: true,
		count: courses.length,
		data: courses,
	});
});

// @description   Get a Single course
// @route         Get/api/v1/courses/:id
// @access        Public

exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description',
	});

	if (!course) {
		return next(
			new ErrorResponse(`No course with the id of ${req.params.id}`),
			404
		);
	}

	res.status(200).json({
		status: true,
		data: course,
	});
});

// @description   Add a course
// @route         Post/api/v1/bootcamps/bootcampId/courses
// @access        Private

exports.addCourse = asyncHandler(async (req, res, next) => {
	// pull bootcamp from params & add to body
	req.body.bootcamp = req.params.bootcampId;

	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(
			new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
			404
		);
	}
	const course = await Course.create(req.body);

	res.status(200).json({
		status: true,
		data: course,
	});
});
