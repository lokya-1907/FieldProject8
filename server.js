const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Load users from JSON file
const loadUsers = () => {
    const data = fs.readFileSync(path.join(__dirname, 'data', 'users.json'));
    return JSON.parse(data);
};

// Save users to JSON file
const saveUsers = (users) => {
    fs.writeFileSync(path.join(__dirname, 'data', 'users.json'), JSON.stringify(users, null, 2));
};

// Authentication Routes
app.post('/api/auth/register', (req, res) => {
    const { fullName, email, password, phoneNumber } = req.body;
    const users = loadUsers();

    // Check if user already exists
    const existingUser  = users.find(user => user.email === email);
    if (existingUser ) {
        return res.status(400).json({ message: 'User  already exists' });
    }

    // Add new user
    const newUser  = { fullName, email, password, phoneNumber };
    users.push(newUser );
    saveUsers(users);
    res.status(201).json({ message: 'User  registered successfully' });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();

    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', user });
});

// Update user profile
app.put('/api/auth/update-profile', (req, res) => {
    const { email, fullName, password, phoneNumber } = req.body;
    const users = loadUsers();

    // Find the user by email
    const userIndex = users.findIndex(user => user.email === email);
    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Update user details
    if (fullName) users[userIndex].fullName = fullName;
    if (password) users[userIndex].password = password;
    if (phoneNumber) users[userIndex].phoneNumber = phoneNumber;

    // Save updated users to the file
    saveUsers(users);

    res.status(200).json({
        "message": "Profile updated successfully",
        "user": {
            "fullName": "Updated Name",
            "email": "user@example.com",
            "password": "newpassword123",
            "phoneNumber": "9876543210"
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});