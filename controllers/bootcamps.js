// @description   Get all bootcamps
// @route         Get/api/v1/bootcamps
// @access        Public

exports.getBootcamps = (req, res, next) => {
	res.status(200).json({ success: true, msg: `Show all bootcamps` });
};

// @description   Get single bootcamps
// @route         Get/api/v1/bootcamps/:id
// @access        Public
exports.getBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @description   Create bootcamps
// @route         POST/api/v1/bootcamps/
// @access        Private
exports.createBootcamp = (req, res, next) => {
	res.status(200).json({ success: true, msg: `Create new bootcamp` });
};

// @description   Update bootcamp
// @route         PUT/api/v1/bootcamps/:id
// @access        Private
exports.updateBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @description   Delete bootcamp
// @route         DELETE/api/v1/bootcamps/:id
// @access        Private
exports.deleteBootcamp = (req, res, next) => {
	res
		.status(200)
		.json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
