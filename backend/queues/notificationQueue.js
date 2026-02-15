const Queue = require('bull');

const notificationQueue = new Queue('notifications', {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: false     // Keep failed jobs for debugging
  }
});

// Queue event listeners
notificationQueue.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed successfully`);
});

notificationQueue.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

notificationQueue.on('stalled', (job) => {
  console.warn(`⚠️  Job ${job.id} stalled`);
});

notificationQueue.on('progress', (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

// Helper function to add jobs
async function addNotificationJob(eventType, data, options = {}) {
  try {
    const job = await notificationQueue.add(
      {
        eventType,
        data,
        timestamp: new Date()
      },
      {
        delay: options.delay || 0,
        priority: options.priority || 0,
        ...options
      }
    );

    console.log(`📨 Job ${job.id} added to queue: ${eventType}`);
    return job;
  } catch (error) {
    console.error('Failed to add job to queue:', error);
    throw error;
  }
}

module.exports = {
  notificationQueue,
  addNotificationJob
};
