const axios = require('axios');

const getHeaders = () => ({
    'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
});

const getUrl = () => `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

exports.sendWhatsAppTemplate = async (to, templateName, components) => {
    try {
        const data = {
            messaging_product: 'whatsapp',
            to: to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: 'en_US' },
                components: components || []
            }
        };

        const response = await axios.post(getUrl(), data, { headers: getHeaders() });
        console.log(`✅ WhatsApp sent to ${to}: ${templateName}`);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp Template Error:', error.response?.data || error.message);
        // throw error; // Don't crash the worker
    }
};

exports.sendTextMessage = async (to, text) => {
    try {
        await axios.post(getUrl(), {
            messaging_product: 'whatsapp',
            recipient_type: "individual",
            to: to,
            type: "text",
            text: { preview_url: false, body: text }
        }, { headers: getHeaders() });
        console.log(`✅ WhatsApp text sent to ${to}`);
    } catch (error) {
         console.error('❌ WhatsApp Text Error:', error.response?.data || error.message);
    }
};

// Functions expected by notificationWorker.js

exports.sendText = async ({ to, message }) => {
    return exports.sendTextMessage(to, message);
};

exports.sendInteractiveButtons = async ({ to, text, buttons }) => {
    try {
        const buttonComponents = buttons.map(b => ({
            type: "reply",
            reply: {
                id: b.id,
                title: b.title
            }
        }));

        await axios.post(getUrl(), {
            messaging_product: 'whatsapp',
            recipient_type: "individual",
            to: to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: text },
                action: { buttons: buttonComponents }
            }
        }, { headers: getHeaders() });
        console.log(`✅ WhatsApp Buttons sent to ${to}`);
    } catch (error) {
        console.error('❌ WhatsApp Buttons Error:', error.response?.data || error.message);
    }
};

exports.sendDocument = async ({ to, url, fileName, caption }) => {
    try {
        await axios.post(getUrl(), {
            messaging_product: 'whatsapp',
            recipient_type: "individual",
            to: to,
            type: "document",
            document: {
                link: url,
                filename: fileName,
                caption: caption
            }
        }, { headers: getHeaders() });
        console.log(`✅ WhatsApp Document sent to ${to}`);
    } catch (error) {
        console.error('❌ WhatsApp Document Error:', error.response?.data || error.message);
    }
};
