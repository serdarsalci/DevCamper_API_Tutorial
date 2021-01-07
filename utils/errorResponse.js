class ErrorResponse extends Error {
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		console.log('ErrorResponse in utils');
	}
}

module.exports = ErrorResponse;
