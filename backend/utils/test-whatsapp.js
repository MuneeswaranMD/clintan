const axios = require('axios');

async function testOrder() {
  try {
    console.log('🚀 Triggering Order Create...');
    const res = await axios.post('http://localhost:5000/api/orders', {
      customerId: 'TEST001',
      customerName: 'Test Automation User',
      customerPhone: '918300864083', // Using company phone for test
      items: [{ name: 'Test Product', quantity: 1, price: 500 }],
      amount: 500
    });
    console.log('✅ Order Created:', res.data);
  } catch (err) {
    console.error('❌ Order Error:', err.response ? err.response.data : err.message);
  }
}

testOrder();
