# 📝 Add Sample Orders to Firestore

## Quick Start

### 1. Install tsx (if not already installed)
```bash
npm install -D tsx
```

### 2. Get Your User ID

**Option A: From Firebase Console**
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to Authentication → Users
3. Copy your User UID

**Option B: From Your CRM**
1. Open browser console (F12)
2. Run: `localStorage.getItem('userId')`
3. Copy the value

### 3. Run the Script
```bash
npm run add-orders YOUR_USER_ID
```

**Example:**
```bash
npm run add-orders abc123xyz456
```

---

## What Gets Created

The script creates **8 sample orders** with different statuses:

| # | Customer | Status | Payment | Amount | Source |
|---|----------|--------|---------|--------|--------|
| 1 | Rajesh Kumar | Pending | Pending | Random | Website |
| 2 | Priya Sharma | Pending | Pending | Random | WhatsApp |
| 3 | Amit Patel | Estimate Sent | Pending | Random | Website |
| 4 | Sneha Reddy | Estimate Accepted | Paid | Random | Public Form |
| 5 | Vikram Singh | Dispatched | Paid | Random | WhatsApp |
| 6 | Ananya Iyer | Delivered | Paid | Random | Website |
| 7 | Rahul Verma | Pending | Pending | Random | Public Form |
| 8 | Kavya Nair | Processing | Paid | Random | Website |

### Sample Products
Each order contains 1-3 random items from:
- Laptop Stand (₹1,500)
- Wireless Mouse (₹800)
- Mechanical Keyboard (₹3,500)
- USB-C Hub (₹2,200)
- Monitor Arm (₹4,500)
- Webcam HD (₹2,800)
- Desk Lamp (₹1,200)
- Cable Organizer (₹500)
- Ergonomic Chair Cushion (₹1,800)
- Noise Cancelling Headphones (₹5,500)

---

## Sample Output

```
🚀 Starting to add sample orders...

📝 Adding sample orders for user: abc123xyz

✅ Order 1/8 created:
   ID: ORD-234567
   Customer: Rajesh Kumar
   Status: Pending
   Amount: ₹4,300
   Firestore ID: xyz789abc

✅ Order 2/8 created:
   ID: ORD-345678
   Customer: Priya Sharma
   Status: Pending
   Amount: ₹2,100
   Firestore ID: abc123xyz

... (6 more orders)

📊 Summary:
   ✅ Successfully created: 8 orders
   ❌ Failed: 0 orders

🎉 Done! Check your CRM Orders page to see the sample orders.

✨ All done!
```

---

## Verify Orders

### In Your CRM:
1. Open your app: `http://localhost:5173`
2. Navigate to **Orders** page
3. You should see 8 new orders with different statuses

### In Firebase Console:
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to Firestore Database
3. Open `orders` collection
4. Verify 8 new documents

---

## Test the Workflow

Now you can test the complete order workflow:

### 1. Convert Pending Order to Estimate
- Find a **Pending** order (Rajesh Kumar or Priya Sharma)
- Hover over the order row
- Click the **📄 icon** (Convert to Estimate)
- Verify estimate is created

### 2. Test WhatsApp Verification
- Use the **Estimate Sent** order (Amit Patel)
- Simulate WhatsApp reply "ACCEPT"
- Verify status updates to "Estimate Accepted"

### 3. Test Dispatch
- Use the **Estimate Accepted** order (Sneha Reddy)
- Click "Dispatch Processing"
- Verify status updates to "Dispatched"

### 4. Test Delivery
- Use the **Dispatched** order (Vikram Singh)
- Click "Final Delivery"
- Verify status updates to "Delivered"

---

## Clear Sample Data (Optional)

If you want to remove the sample orders:

### Option 1: Manual (Firebase Console)
1. Go to Firestore Database
2. Open `orders` collection
3. Delete orders one by one

### Option 2: Bulk Delete (Future Enhancement)
We can create a cleanup script if needed.

---

## Troubleshooting

### Error: "Please provide a userId"
```bash
# Make sure to pass your user ID
npm run add-orders YOUR_USER_ID
```

### Error: "tsx: command not found"
```bash
# Install tsx
npm install -D tsx
```

### Error: "Permission denied"
```bash
# Check Firebase rules allow order creation
# Verify your userId is correct
```

### Orders not appearing in CRM?
1. Refresh the Orders page
2. Check browser console for errors
3. Verify Firebase connection
4. Check Firestore security rules

---

## Script Details

**Location:** `src/utils/addSampleOrders.ts`

**What it does:**
1. Connects to Firebase using your project credentials
2. Generates 8 orders with realistic data
3. Each order has:
   - Unique order ID (ORD-XXXXXX)
   - Customer details (name, phone, email, address)
   - 1-3 random products
   - Calculated total amount
   - Appropriate status
   - Payment info
   - Source tracking
4. Adds orders to Firestore `orders` collection
5. Links orders to your user ID

---

## Next Steps

After adding sample orders:

1. ✅ **Test Order Workflow**
   - Convert orders to estimates
   - Test status transitions
   - Verify data integrity

2. ✅ **Test WhatsApp Integration**
   - Set up n8n workflows
   - Test WhatsApp notifications
   - Test reply handling

3. ✅ **Test Invoice Generation**
   - Generate invoices from orders
   - Test PDF templates
   - Test email sending

4. ✅ **Test Estimates**
   - Create estimates from orders
   - Test approval workflow
   - Test rejection handling

---

**Your sample orders are ready to use! 🎉**

Run `npm run add-orders YOUR_USER_ID` to get started!
