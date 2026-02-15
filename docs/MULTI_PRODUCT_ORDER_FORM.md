# Multi-Product Order Form - Omnichannel Integration

## Overview
The Order Form has been completely redesigned to support **multiple products** in a single order, making it perfect for businesses selling crackers, toys, electronics, and other products. Customers can now browse your catalog, add multiple items to their cart, and checkout all at once.

## Key Features

### 🛒 **Shopping Cart System**
- **Browse Products**: View all available products in a grid layout
- **Add to Cart**: Click "Add" to add products to cart
- **Quantity Control**: Increase/decrease quantities with +/- buttons
- **Remove Items**: Delete items from cart with trash icon
- **Real-time Totals**: See subtotal, tax, and grand total update automatically

### 📦 **Product Catalog**
- **Product Cards**: Each product shows:
  - Product name
  - Description
  - Price
  - Stock availability (if enabled)
  - Add to cart button
- **Stock Indicators**:
  - Green badge: 10+ items in stock
  - Yellow badge: Low stock (1-10 items)
  - Red badge: Out of stock
- **Visual Feedback**: Selected products highlighted in blue

### 💰 **Smart Pricing**
- **Per-Product Pricing**: Each product can have different prices
- **Automatic Tax Calculation**: Tax calculated per product based on tax percentage
- **Running Total**: See total cost update as you add/remove items
- **Multi-Currency Support**: Supports ₹, $, £, etc.

### 📋 **Customer Information**
- **Name**: Required field
- **Phone**: Required with country code selector (🇮🇳 +91, 🇺🇸 +1, 🇬🇧 +44, 🇦🇪 +971)
- **Email**: Optional field
- **Delivery Address**: Required textarea
- **Order Notes**: Optional notes for special instructions

### 🎯 **Omnichannel Tracking**
The form automatically tracks order sources:
- **URL Parameters**: `?source=Facebook` or `?channel=Instagram`
- **Default Source**: "Public Link" if no parameter
- **Channel Tracking**: Automatically captures WEBSITE, FACEBOOK, INSTAGRAM, WHATSAPP, etc.

## Use Cases

### 1. **Crackers Shop** 🎆
```
Customer adds:
- Sparklers (10 boxes) - ₹500
- Rockets (5 packs) - ₹300
- Flower Pots (20 pieces) - ₹400
Total: ₹1,200 + Tax
```

### 2. **Toy Store** 🧸
```
Customer adds:
- LEGO Set - ₹2,999
- Barbie Doll - ₹899
- Hot Wheels (3 cars) - ₹450
Total: ₹4,348 + Tax
```

### 3. **Electronics Store** 📱
```
Customer adds:
- Wireless Mouse - ₹599
- USB Cable (2 pcs) - ₹198
- Phone Case - ₹299
Total: ₹1,096 + Tax
```

### 4. **Grocery Store** 🛒
```
Customer adds:
- Rice (5 kg) - ₹250
- Dal (2 kg) - ₹180
- Oil (1 L) - ₹150
Total: ₹580 + Tax
```

## Layout Structure

### **Desktop View** (Large Screens)
```
┌─────────────────────────────────────────────────────┐
│                    Header                           │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│   Product Catalog        │   Cart & Checkout       │
│   (2/3 width)            │   (1/3 width, sticky)   │
│                          │                          │
│   [Product Cards Grid]   │   [Cart Items]          │
│                          │   [Totals]              │
│                          │   [Customer Form]       │
│                          │   [Place Order Button]  │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

### **Mobile View** (Small Screens)
```
┌─────────────────────┐
│      Header         │
├─────────────────────┤
│  Product Catalog    │
│  [Product Cards]    │
├─────────────────────┤
│  Cart & Checkout    │
│  [Cart Items]       │
│  [Totals]          │
│  [Customer Form]    │
│  [Place Order]      │
└─────────────────────┘
```

## How It Works

### **Step 1: Browse Products**
- Customer sees all available products
- Products show price, description, and stock status
- Out-of-stock items are grayed out

### **Step 2: Add to Cart**
- Click "Add" button on any product
- Product appears in cart with quantity 1
- Clicking "Add" again increases quantity

### **Step 3: Manage Cart**
- Use +/- buttons to adjust quantities
- Click trash icon to remove items
- See totals update in real-time

### **Step 4: Fill Details**
- Enter name, phone, email (optional)
- Add delivery address
- Add order notes (optional)

### **Step 5: Place Order**
- Click "Place Order" button
- Order is created in CRM
- Webhook triggered (if configured)
- Success message shown

## Technical Details

### **State Management**
```typescript
interface CartItem {
    product: Product;
    quantity: number;
}

const [cart, setCart] = useState<CartItem[]>([]);
```

### **Cart Functions**
- `addToCart(product)` - Add product to cart
- `updateQuantity(productId, newQuantity)` - Update item quantity
- `removeFromCart(productId)` - Remove item from cart
- `clearCart()` - Empty the cart
- `calculateTotals()` - Calculate subtotal, tax, and grand total

### **Stock Validation**
```typescript
if (config?.enableStock && product?.inventory) {
    if (newQuantity > product.inventory.stock) {
        setError(`Only ${product.inventory.stock} units available`);
        return;
    }
}
```

### **Order Data Structure**
```typescript
{
    orderId: "ORD-123456",
    customerName: "John Doe",
    customerPhone: "+919876543210",
    items: [
        {
            itemId: "prod_1",
            name: "Product 1",
            quantity: 2,
            price: 500,
            taxPercentage: 18,
            subtotal: 1000,
            total: 1180
        },
        // ... more items
    ],
    pricingSummary: {
        subTotal: 2000,
        taxTotal: 360,
        grandTotal: 2360
    },
    source: "Facebook",
    channel: "FACEBOOK"
}
```

## Omnichannel Integration

### **Share Links with Tracking**
```
Base URL: https://your-domain.com/#/order-form/USER_ID

Facebook: ?source=Facebook&channel=FACEBOOK
Instagram: ?source=Instagram&channel=INSTAGRAM
WhatsApp: ?source=WhatsApp&channel=WHATSAPP
Website: ?source=Website&channel=WEBSITE
```

### **Track Performance**
- See which channel brings most orders
- Analyze conversion rates per source
- Optimize marketing spend

## Benefits

### **For Customers** 👥
✅ Browse entire catalog  
✅ Add multiple products at once  
✅ See total cost before ordering  
✅ Easy quantity adjustments  
✅ Mobile-friendly interface  
✅ Fast checkout process  

### **For Business Owners** 💼
✅ Increase average order value  
✅ Reduce order processing time  
✅ Track inventory automatically  
✅ Omnichannel analytics  
✅ Automated order notifications  
✅ Professional brand image  

## Customization Options

### **In Settings**
- Enable/disable stock tracking
- Enable/disable tax calculation
- Set default tax percentage
- Set currency symbol
- Upload company logo
- Configure n8n webhook URL

### **Per Product**
- Set individual prices
- Set individual tax rates
- Manage stock levels
- Add descriptions
- Enable/disable products

## Best Practices

1. **Product Images**: Add clear product images (coming soon)
2. **Descriptions**: Write clear, concise descriptions
3. **Pricing**: Keep prices updated
4. **Stock**: Enable stock tracking to avoid overselling
5. **Testing**: Test the form before sharing
6. **Mobile**: Always check mobile view
7. **Tracking**: Use source parameters in all marketing

## Future Enhancements

- [ ] Product images in catalog
- [ ] Product categories/filters
- [ ] Search functionality
- [ ] Discount codes
- [ ] Delivery fee calculation
- [ ] Payment gateway integration
- [ ] Order tracking for customers
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Quick add from search

## Troubleshooting

### Cart not updating?
- Check browser console for errors
- Ensure products have valid pricing
- Verify stock settings

### Orders not creating?
- Check Firestore security rules
- Verify userId in URL
- Check network tab for API errors

### Webhook not firing?
- Verify webhook URL in settings
- Check webhook endpoint is accessible
- Review webhook payload format

---

**The new multi-product order form is now live and ready to accept orders!** 🎉
