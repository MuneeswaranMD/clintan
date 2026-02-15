require('dotenv').config();
const app = require('./app');

// Start notification worker
require('./workers/notificationWorker');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`   Clintan Automation Backend`);
  console.log('   ========================================');
  console.log(`   🌐 Server: http://localhost:${PORT}`);
  console.log(`   📧 Email: ${process.env.GMAIL_USER ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   📱 WhatsApp: ${process.env.WHATSAPP_PHONE_ID ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`   🔴 Redis: ${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`);
  console.log(`   🔥 Firebase: ${process.env.FIREBASE_PROJECT_ID || 'Not configured'}`);
  console.log(`   👷 Worker: Running`);
  console.log('   ========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
