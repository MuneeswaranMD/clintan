# WhatsApp Order Verification - Setup Guide

Your workflow configuration is saved in `whatsapp-order-verification.json`. Follow these steps to get it running in n8n.

## 1. Import Workflow to n8n

1.  Open your n8n dashboard (e.g., `https://n8n-render-cf3i.onrender.com/`).
2.  Click **"Add Workflow"** (top right) -> **"Import from..."** -> **"From File"**.
    *   *Alternatively, copy the content of `whatsapp-order-verification.json` and paste it directly into the n8n canvas (Ctrl+V).*

## 2. Configure Credentials

You verify your WhatsApp API works! Now add those keys to n8n.

### WhatsApp Cloud API
1.  In n8n, go to **Credentials** -> **New Credential** -> Search **"WhatsApp Cloud API"**.
2.  Enter the details from your successful curl command:
    *   **Access Token**: `EAAZARu7QdWVABQsVZB0ElnL2F0PnlyomKfVnkGg63LFL3IyzgLFl8Yv6mdPD7OV7ZA3tkuQiyojt0kpsZBT1eFK85PIDAUmzgiQ9ZC13WwYXWZB0hlHC4t4dfDm34kK40AYbTiqo5mdWbyUX3v8kwimVGj7LYYu8RdwjRWVCUUHS4eXPO2cqq8BsWZBCBsh4ZAssK2H1x68ZB4omVPWcWDvetpygtKNssZC4opWVBuCXyGVXRBGJnxNbzHODvsDZBHNaVaT6vIUzn1nlIH4RDL6ZAOsYwwQOvkhUZB5wV8p5DwgZDZD`
    *   **Phone Number ID**: `1033237316520058`
    *   **Business Account ID**: (Find this in your Meta Business settings, usually near the Phone Number ID)
3.  **Pro Tip**: The token above might expire (it looks like a temporary one). Typically, you should create a **System User** with a permanent token in Meta Business Settings for production.

### Firebase
1.  In n8n, go to **Credentials** -> **New Credential**.
2.  Search for **"Firebase Account"** (or "Google Firebase Cloud Firestore" depending on the node type in use).
    *   *Note: The current workflow uses the generic `Firebase Account` credential type.*
3.  Paste your Service Account JSON (Project ID: `clintan`).

## 3. Activate Workflow
1.  Open the workflow on the canvas.
2.  Toggle **"Active"** to ON (top right).
3.  Save the workflow.

## 4. Webhook URLs
Update your external services to point to the production webhooks:

| Trigger | URL Pattern |
| :--- | :--- |
| **Order Created** | `[YOUR_N8N_URL]/webhook/order-created` |
| **Estimate Created** | `[YOUR_N8N_URL]/webhook/estimate-created` |
| **WhatsApp Reply** | `[YOUR_N8N_URL]/webhook/whatsapp-incoming` |
| **Dispatch** | `[YOUR_N8N_URL]/webhook/order-dispatched` |

**Important**: For the **WhatsApp Reply** webhook, you must exactlty configure this URL in the **Meta App Dashboard** -> **WhatsApp** -> **Configuration** -> **Callback URL**.
