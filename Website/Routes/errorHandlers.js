/*
This file contains error handling middleware for the application
*/

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Server error',
        error: err.message
    });
};

// Database access denial middleware
const denyDatabaseAccess = (req, res, next) => {
    res.status(403).send('Access denied');
};

module.exports = {
    globalErrorHandler,
    denyDatabaseAccess
};