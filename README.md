<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19ykwYEy5cNfp68BGgP95U2JOGVrvIoDg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Features

### Public Order Forms
Each user has a unique public order form link that can be shared with customers.
- Navigate to the **Orders** page.
- Click the **Form Link** button in the header.
- The link is copied to your clipboard (e.g., `https://your-app.com/#/order-form/USER_ID`).
- Customers can use this link to place orders directly into your system.

### Automatic Configuration
For new users, the system automatically:
- Creates a default company profile.
- Sets up initial business configurations based on a default template.
- Ensures seamless onboarding without manual database setup.
