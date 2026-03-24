const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    // Role-based access for admin area
    role: {
      type: String,
      enum: ['CUSTOMER', 'SUPER_ADMIN', 'MANAGER', 'SUPPORT'],
      default: 'CUSTOMER',
    },
    // Simple notes/tags used in admin for user management
    notes: { type: String },
    tags: [{ type: String }],
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        qty: { type: Number, required: true, min: 1 },
        // Optional denormalized fields for quicker reads / analytics
        priceAtAdd: { type: Number },
        nameAtAdd: { type: String },
        imageAtAdd: { type: String },
        slugAtAdd: { type: String },
      },
    ],
    // Shipping Information
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'Kenya' },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
