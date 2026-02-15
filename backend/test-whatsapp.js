require('dotenv').config();
const whatsappService = require('./services/whatsappService');

async function testWhatsApp() {
  console.log('\n🧪 ========================================');
  console.log('   WhatsApp Service Test');
  console.log('   ========================================\n');

  console.log('📱 Sending test WhatsApp message...');
  console.log(`   Phone Number ID: ${process.env.WHATSAPP_PHONE_ID}`);
  console.log(`   To: 918300864083`);
  console.log(`   Template: hello_world\n`);

  try {
    const result = await whatsappService.testMessage('918300864083');

    console.log('\n✅ ========================================');
    console.log('   SUCCESS!');
    console.log('   ========================================');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Recipient: ${result.recipient}`);
    console.log('\n📱 Check your WhatsApp!');
    console.log('   Phone: +91 8300864083\n');

  } catch (error) {
    console.log('\n❌ ========================================');
    console.log('   FAILED!');
    console.log('   ========================================');
    console.error(`   Error: ${error.message}\n`);

    if (error.response?.data) {
      console.log('💡 Error Details:');
      console.log(`   Code: ${error.response.data.error.code}`);
      console.log(`   Message: ${error.response.data.error.message}`);
      console.log(`   Type: ${error.response.data.error.type}\n`);
    }

    console.log('💡 Troubleshooting:');
    console.log('   1. Check WHATSAPP_PHONE_ID in .env');
    console.log('   2. Check WHATSAPP_ACCESS_TOKEN in .env');
    console.log('   3. Verify phone number format: 918300864083');
    console.log('   4. Ensure hello_world template exists\n');
  }
}

// Run test
testWhatsApp();
