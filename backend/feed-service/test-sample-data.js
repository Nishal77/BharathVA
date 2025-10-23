// Test script to create sample data
const sampleFeeds = [
  {
    userId: "24436b2a-cb17-4aec-8923-7d4a9fc1f5ca",
    message: "Beautiful sunset at the beach today! 🌅",
    imageIds: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    userId: "24436b2a-cb17-4aec-8923-7d4a9fc1f5ca",
    message: "Amazing mountain landscape from my hiking trip 🏔️",
    imageIds: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    userId: "9c58dc97-390f-43ed-8950-cdef29930756",
    message: "Peaceful forest walk in nature 🌲",
    imageIds: [],
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // 10 hours ago
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
  },
  {
    userId: "24436b2a-cb17-4aec-8923-7d4a9fc1f5ca",
    message: "Testing text-only post without images",
    imageIds: [],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000)
  }
];

console.log('Sample feeds to be created:');
sampleFeeds.forEach((feed, index) => {
  console.log(`${index + 1}. User: ${feed.userId}`);
  console.log(`   Message: ${feed.message}`);
  console.log(`   Created: ${feed.createdAt}`);
  console.log('');
});

// This would be used to insert data via API calls
console.log('To insert this data, you would need to:');
console.log('1. Get authentication token');
console.log('2. Call POST /api/feed/create for each feed');
console.log('3. Or use the SampleDataLoader in the application');
