const bcrypt = require('bcrypt');
const User = require('../models/userModel'); // Example user model

// Function to hash the password
async function hashPassword(plainPassword) {
    const saltRounds = 10;
    return await bcrypt.hash(plainPassword, saltRounds);
}

// Function to create a new user
async function createNewAccount(req, res) {
    const { username, password } = req.body;

    try {
        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Save the user to the database
        const newUser = new User({
            username: username,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
}

module.exports = { createNewAccount };