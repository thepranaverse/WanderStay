class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message); // ✅ correct way
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
