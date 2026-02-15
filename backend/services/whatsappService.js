const axios = require('axios');

class WhatsAppService {
  constructor() {
    this.baseUrl = 'https://graph.facebook.com/v22.0';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (this.phoneNumberId && this.accessToken) {
      console.log('✅ WhatsApp service configured');
      console.log(`   Phone Number ID: ${this.phoneNumberId}`);
    } else {
      console.log('⚠️  WhatsApp service not configured');
    }
  }

  async sendTemplate({ to, templateName, templateParams = [] }) {
    try {
      // Prepare template components
      const components = templateParams.length > 0 ? [{
        type: 'body',
        parameters: templateParams.map(param => ({
          type: 'text',
          text: String(param)
        }))
      }] : [];

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en_US' },
            components: components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ WhatsApp sent:', response.data.messages[0].id);
      console.log(`   To: ${to}`);
      console.log(`   Template: ${templateName}`);

      return { 
        success: true, 
        messageId: response.data.messages[0].id,
        recipient: to
      };

    } catch (error) {
      console.error('❌ WhatsApp failed:', error.response?.data || error.message);
      
      if (error.response?.data) {
        const errorData = error.response.data.error;
        console.error(`   Error Code: ${errorData.code}`);
        console.error(`   Error Message: ${errorData.message}`);
      }

      throw error;
    }
  }

  async sendText({ to, message }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ WhatsApp text sent:', response.data.messages[0].id);
      return { success: true, messageId: response.data.messages[0].id };

    } catch (error) {
      console.error('❌ WhatsApp text failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendDocument({ to, url, fileName, caption }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'document',
          document: {
            link: url,
            filename: fileName || 'document.pdf',
            caption: caption
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ WhatsApp document sent:', response.data.messages[0].id);
      return { success: true, messageId: response.data.messages[0].id };

    } catch (error) {
      console.error('❌ WhatsApp document failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendInteractiveButtons({ to, text, buttons }) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: text },
            action: {
              buttons: buttons.map((btn, index) => ({
                type: 'reply',
                reply: {
                  id: btn.id || `btn_${index}`,
                  title: btn.title
                }
              }))
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ WhatsApp interactive sent:', response.data.messages[0].id);
      return { success: true, messageId: response.data.messages[0].id };

    } catch (error) {
      console.error('❌ WhatsApp interactive failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Test with hello_world template
  async testMessage(phoneNumber) {
    return this.sendTemplate({
      to: phoneNumber,
      templateName: 'hello_world',
      templateParams: []
    });
  }
}

module.exports = new WhatsAppService();
