const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'admin@caseproz.co.ke';
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.isAdmin = true;
      await existingUser.save();
      console.log(`User ${email} is now an admin`);
    } else {
      const user = await User.create({
        name: 'Admin User',
        email,
        password: 'password123',
        isAdmin: true
      });
      console.log(`Admin User created: ${user.email}`);
    }

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createAdmin();
