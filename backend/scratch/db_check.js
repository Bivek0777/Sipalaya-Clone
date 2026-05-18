const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sipalaya_it_training';

const checkDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to:', MONGO_URI);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`- ${col.name}: ${count}`);
    }

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
