// routes/accountRoutes.js
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// API Routes
router.post('/api/auth/login', accountController.login);
router.post('/api/auth/register', accountController.register);
router.post('/api/users/delete-account', accountController.deleteAccount);
router.get('/api/users/:id', accountController.getAccountById);
router.post('/api/users/update-profile', accountController.updateProfile);

// View Routes
router.get('/profile/:id', accountController.renderProfile);

module.exports = router;