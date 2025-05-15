require('dotenv').config();
const mongoose = require('mongoose');
const { Edition } = require('../models/edition.model');
const { LibraryImage } = require('../models/libraryImage.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function migrateLibraryImages() {
  try {
    console.log('Starting library images migration...');
    
    // Get all editions with libraryImages
    const editions = await Edition.find({ 'libraryImages.0': { $exists: true } });
    console.log(`Found ${editions.length} editions with library images to migrate`);
    
    let totalMigrated = 0;
    
    for (const edition of editions) {
      console.log(`Processing edition ID: ${edition._id}, found ${edition.libraryImages.length} images`);
      
      const libraryImageDocs = edition.libraryImages.map(imageUrl => ({
        editionId: edition._id,
        userId: edition.userId,
        imageUrl: imageUrl,
      }));
      
      if (libraryImageDocs.length > 0) {
        await LibraryImage.insertMany(libraryImageDocs);
        totalMigrated += libraryImageDocs.length;
        console.log(`Migrated ${libraryImageDocs.length} images for edition ${edition._id}`);
      }
    }
    
    console.log(`Migration complete. Total images migrated: ${totalMigrated}`);
    console.log('Note: Original libraryImages arrays in Edition documents are preserved for backwards compatibility.');
    
    return totalMigrated;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
migrateLibraryImages()
  .then(count => {
    console.log(`Successfully migrated ${count} library images.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration script failed:', err);
    process.exit(1);
  }); 