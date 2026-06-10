const BRAND_COLOR_PRIMARY = '#E07A5F'; // Peach/Coral
const BRAND_COLOR_SECONDARY = '#81B29A'; // Soft Sage
const BRAND_COLOR_DARK = '#3D405B'; // Deep Slate
const BRAND_COLOR_LIGHT = '#F4F1DE'; // Ivory/Cream

const getEmailLayout = (title: string, bodyContent: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8F9FA; margin: 0; padding: 0; color: #4A4A4A; }
    .container { max-width: 600px; margin: 20px auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #EAEAEA; }
    .header { background-color: ${BRAND_COLOR_PRIMARY}; padding: 30px; text-align: center; color: #FFFFFF; }
    .header h1 { margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 1px; }
    .header p { margin: 5px 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 40px 30px; line-height: 1.6; }
    .btn { display: inline-block; padding: 12px 24px; background-color: ${BRAND_COLOR_SECONDARY}; color: #FFFFFF !important; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 20px 0; text-align: center; }
    .footer { background-color: ${BRAND_COLOR_LIGHT}; padding: 20px 30px; text-align: center; font-size: 12px; color: ${BRAND_COLOR_DARK}; border-top: 1px solid #EAEAEA; }
    .footer a { color: ${BRAND_COLOR_PRIMARY}; text-decoration: none; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .table th { border-bottom: 2px solid #EAEAEA; padding: 10px; text-align: left; font-size: 14px; }
    .table td { border-bottom: 1px solid #EAEAEA; padding: 10px; font-size: 14px; }
    .price-text { font-weight: bold; color: ${BRAND_COLOR_PRIMARY}; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CrochetCraft Pro</h1>
      <p>Handmade Crochet E-Commerce Platform</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>Need help? Contact us at <a href="mailto:support@crochetcraftpro.com">support@crochetcraftpro.com</a></p>
      <p>&copy; ${new Date().getFullYear()} CrochetCraft Pro. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const getWelcomeEmailHtml = (name: string) => {
  return getEmailLayout('Welcome to CrochetCraft Pro', `
    <h2>Welcome to the family, ${name}!</h2>
    <p>Thank you for joining CrochetCraft Pro. We are thrilled to have you here!</p>
    <p>Explore our premium collections of handmade flowers, bouquets, keychains, and toys. All crafted with 100% organic yarn and stitched with absolute care.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="btn">Start Shopping</a>
  `);
};

export const getPasswordResetHtml = (name: string, resetUrl: string) => {
  return getEmailLayout('Reset Your Password', `
    <h2>Password Reset Request</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset the password for your account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p>If you did not request this reset, please ignore this email.</p>
  `);
};

export const getOrderConfirmationHtml = (name: string, orderNumber: string, items: any[], total: number) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.title} x ${item.quantity}</td>
      <td class="price-text">Rs. ${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return getEmailLayout(`Order Confirmed: ${orderNumber}`, `
    <h2>Thank you for your order, ${name}!</h2>
    <p>Your order <strong>#${orderNumber}</strong> has been successfully placed. We will begin crafting your items shortly.</p>
    <table class="table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr>
          <td><strong>Total Paid</strong></td>
          <td class="price-text"><strong>Rs. ${total}</strong></td>
        </tr>
      </tbody>
    </table>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderNumber}" class="btn">Track Order</a>
  `);
};

export const getOrderShippedHtml = (name: string, orderNumber: string, courierName: string, trackingNumber: string, trackingUrl: string) => {
  return getEmailLayout(`Order Shipped: ${orderNumber}`, `
    <h2>Your order is on the way, ${name}!</h2>
    <p>Great news! Your order <strong>#${orderNumber}</strong> has been completed and shipped via <strong>${courierName}</strong>.</p>
    <p>Tracking Number: <strong>${trackingNumber}</strong></p>
    <a href="${trackingUrl}" class="btn">Track Shipment</a>
  `);
};

export const getOrderDeliveredHtml = (name: string, orderNumber: string) => {
  return getEmailLayout(`Order Delivered: ${orderNumber}`, `
    <h2>Your order has arrived, ${name}!</h2>
    <p>We hope you love your handmade crochet items! Your order <strong>#${orderNumber}</strong> has been delivered.</p>
    <p>Could you take a minute to leave a review? Your feedback helps our artisans continue to create premium crafts.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders/${orderNumber}" class="btn">Write a Review</a>
  `);
};

export const getLowStockAlertHtml = (productTitle: string, sku: string, stock: number) => {
  return getEmailLayout('Low Stock Alert', `
    <h2>Inventory Notification: Low Stock</h2>
    <p>The following product is running low on stock. Please consider replenishment.</p>
    <table class="table">
      <tr>
        <td><strong>Product:</strong></td>
        <td>${productTitle}</td>
      </tr>
      <tr>
        <td><strong>SKU:</strong></td>
        <td>${sku}</td>
      </tr>
      <tr>
        <td><strong>Current Stock:</strong></td>
        <td style="color: red; font-weight: bold;">${stock} remaining</td>
      </tr>
    </table>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/inventory" class="btn">Manage Inventory</a>
  `);
};

export const getAbandonedCartHtml = (name: string, items: any[], checkoutUrl: string) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.product.title} x ${item.quantity}</td>
      <td class="price-text">Rs. ${(item.product.salePrice || item.product.price) * item.quantity}</td>
    </tr>
  `).join('');

  return getEmailLayout('Did you forget something?', `
    <h2>Hi ${name},</h2>
    <p>You left some beautiful handmade items in your shopping cart. We have saved them for you, but stock is limited!</p>
    <table class="table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>
    <a href="${checkoutUrl}" class="btn">Complete Purchase</a>
  `);
};

export const getCustomOrderReceivedHtml = (name: string, title: string, description: string) => {
  return getEmailLayout('Custom Order Request Received', `
    <h2>Custom Order Inquiry Received</h2>
    <p>Hello ${name},</p>
    <p>Thank you for submitting your custom crochet request: <strong>"${title}"</strong>. Our design team will review your specifications and references, and provide a price quote shortly.</p>
    <blockquote style="background-color: ${BRAND_COLOR_LIGHT}; padding: 15px; border-left: 4px solid ${BRAND_COLOR_PRIMARY}; margin: 20px 0;">
      ${description}
    </blockquote>
  `);
};

export const getCustomOrderQuoteHtml = (name: string, title: string, price: number, notes: string, acceptUrl: string) => {
  return getEmailLayout('Custom Order Quote Ready', `
    <h2>We have a quote for your custom request!</h2>
    <p>Hello ${name},</p>
    <p>We are ready to craft your custom request: <strong>"${title}"</strong>.</p>
    <table class="table">
      <tr>
        <td><strong>Quoted Price:</strong></td>
        <td class="price-text">Rs. ${price}</td>
      </tr>
      <tr>
        <td><strong>Designer Notes:</strong></td>
        <td>${notes || 'No notes provided.'}</td>
      </tr>
    </table>
    <a href="${acceptUrl}" class="btn">Review & Accept Quote</a>
  `);
};

export const getRefundProcessedHtml = (name: string, orderNumber: string, amount: number, reason: string) => {
  return getEmailLayout('Refund Processed', `
    <h2>Refund Confirmation</h2>
    <p>Hello ${name},</p>
    <p>A refund of <strong>Rs. ${amount}</strong> has been successfully processed for your order <strong>#${orderNumber}</strong>.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>The funds should appear in your source payment account within 5-7 business days.</p>
  `);
};

export const getCouponExpiredHtml = (name: string, expiredCode: string, newCode: string, discount: string) => {
  return getEmailLayout('We have a gift for you!', `
    <h2>Hi ${name},</h2>
    <p>The coupon code <strong>${expiredCode}</strong> has expired. To make sure you don't miss out on your favorite crochet crafts, we have created a special code just for you!</p>
    <p>Use code <strong style="font-size: 18px; color: ${BRAND_COLOR_PRIMARY};">${newCode}</strong> to get <strong>${discount} off</strong> your next order.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="btn">Shop Now</a>
  `);
};

export const getNewsletterWelcomeHtml = (email: string) => {
  return getEmailLayout('Welcome to the Newsletter', `
    <h2>Subscription Confirmed!</h2>
    <p>Thank you for subscribing to the CrochetCraft Pro newsletter. We are excited to keep you updated on new arrivals, custom order slots, and exclusive member-only discount codes.</p>
    <p>Stay tuned for some amazing crochet inspiration!</p>
  `);
};

export const getNewOfferHtml = (name: string, code: string, discountValue: number, discountType: string, expiryDate: Date, description?: string) => {
  const discountStr = discountType === 'PERCENTAGE' ? `${discountValue}%` : `Rs. ${discountValue}`;
  const formattedExpiry = expiryDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return getEmailLayout('New Offer Generated!', `
    <h2>Exclusive Offer for You!</h2>
    <p>Hi ${name || 'Craft Lover'},</p>
    <p>We have generated a new special discount code just for you! Make the most of this offer on our beautiful handmade crochet collections.</p>
    ${description ? `<p style="font-style: italic; color: #666; margin: 15px 0;">"${description}"</p>` : ''}
    <div style="background-color: ${BRAND_COLOR_LIGHT}; border: 2px dashed ${BRAND_COLOR_PRIMARY}; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
      <p style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: ${BRAND_COLOR_DARK};">Your Coupon Code</p>
      <h3 style="margin: 10px 0; font-size: 28px; color: ${BRAND_COLOR_PRIMARY}; letter-spacing: 2px;">${code}</h3>
      <p style="margin: 0; font-size: 18px; font-weight: bold; color: ${BRAND_COLOR_SECONDARY};">Get ${discountStr} OFF</p>
      <p style="margin: 10px 0 0 0; font-size: 12px; color: #888;">Valid until ${formattedExpiry}</p>
    </div>
    <p>Explore our premium collections of handmade flowers, bouquets, keychains, and toys. Don't wait too long—crafted pieces sell out quickly!</p>
    <div style="text-align: center;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" class="btn">Shop Now with Offer</a>
    </div>
  `);
};
