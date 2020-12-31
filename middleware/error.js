//
const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
	let error = { ...err };
	error.message = err.message;

	// Log to console for dev

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		const messsage = `Resource not found with id of ${err.value}`;
		error = new ErrorResponse(messsage, 404);
	}

	// console.log(err);
	console.log(Object.keys(err.keyValue)[0]);
	console.log(err.keyPattern);

	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = `Duplicate field value entered ${JSON.stringify(
			err.keyValue
		)} taken`;
		error = new ErrorResponse(message, 400);
	}

	res
		.status(error.statusCode || 500)
		.json({ success: false, error: error.message || 'Server Error' });
};

module.exports = errorHandler;
