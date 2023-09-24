import mongoose from 'mongoose'

const connectToMongoDB = async () => {
  try {
    if (typeof process.env.MONGODB_URL === 'string') {
      await mongoose.connect(process.env.MONGODB_URL, {});
      
      // Wait for index creation
      mongoose.connection.once('open', () => {
        console.log('Connected to MongoDB');
      });

      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });
    } else {
      console.error('ERROR: MONGODB_URL is not a string type!');
    }
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
};

// Call the function to connect to MongoDB
connectToMongoDB();