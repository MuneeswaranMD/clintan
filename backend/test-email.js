require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  console.log('\n🧪 ========================================');
  console.log('   Email Service Test');
  console.log('   ========================================\n');

  console.log('📧 Sending test email...');
  console.log(`   From: ${process.env.GMAIL_USER}`);
  console.log(`   To: ideazdevelop27@gmail.com`);
  console.log(`   Subject: Test Email from Clintan Backend\n`);

  try {
    const result = await emailService.sendEmail({
      to: 'ideazdevelop27@gmail.com',
      subject: '🧪 Test Email from Clintan Backend',
      html: emailService.getInvoiceTemplate({
        customer_name: 'Test User',
        invoice_number: 'TEST-001',
        amount: '1,000',
        due_date: 'March 15, 2026'
      })
    });

    console.log('\n✅ ========================================');
    console.log('   SUCCESS!');
    console.log('   ========================================');
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`   Recipient: ${result.recipient}`);
    console.log('\n📬 Check your inbox at: ideazdevelop27@gmail.com');
    console.log('   (Check spam folder if not in inbox)\n');

  } catch (error) {
    console.log('\n❌ ========================================');
    console.log('   FAILED!');
    console.log('   ========================================');
    console.error(`   Error: ${error.message}\n`);

    if (error.message.includes('Invalid login')) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check GMAIL_APP_PASSWORD in .env');
      console.log('   2. Make sure 2FA is enabled on Gmail');
      console.log('   3. Password should be: eordzvbqdoiuzstx\n');
    }
  }
}

// Run test
testEmail();
