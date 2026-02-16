const Razorpay = require('razorpay');

// Use dummy keys if not provided, just for structure.
// In production, these must be real.
const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
});

exports.generatePaymentLink = async (orderId, amount, customer) => {
    try {
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'dummy_id') {
            console.log('⚠️ RAZORPAY_KEY_ID not set. Using mock link.');
            return `https://mock-payment-gateway.com/pay/${orderId}`;
        }
        
        const paymentLink = await instance.paymentLink.create({
            amount: amount * 100, // amount in smallest currency unit
            currency: "INR",
            accept_partial: false,
            reference_id: orderId,
            description: `Payment for Order #${orderId}`,
            customer: {
                name: customer.name || "Customer",
                contact: customer.phone,
                email: customer.email || "customer@example.com"
            },
            notify: {
                sms: true,
                email: true
            },
            reminder_enable: true,
            callback_url: `${process.env.API_URL}/payment-success`,
            callback_method: "get"
        });
        
        return paymentLink.short_url;
    } catch (error) {
        console.error("Error creating payment link:", error);
         // Fallback for demo if credentials fail
        return `https://mock-payment-gateway.com/pay/${orderId}?error=true`;
    }
};
