/**
 * Generates the HTML for the order confirmation email.
 * @param {Object} order - The order object.
 * @param {Object} user - The user object (optional).
 * @param {Array} recommendedProducts - An array of 3 recommended products.
 * @returns {string} The HTML content.
 */
const generateOrderConfirmationEmail = (order, user, recommendedProducts = []) => {
  const itemsRowsHtml = order.orderItems
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; vertical-align: middle;">
          <div style="font-weight: 600; color: #1a202c;">${item.name}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: center; color: #4a5568;">${item.qty}</td>
        <td style="padding: 12px; border-bottom: 1px solid #edf2f7; text-align: right; font-weight: 600; color: #1a202c;">KSh ${item.price.toLocaleString()}</td>
      </tr>`
    )
    .join('');

  const shippingText = order.shippingAddress
    ? `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`
    : 'N/A';

  const recommendedHtml = recommendedProducts.length > 0 ? `
    <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #edf2f7;">
      <h3 style="margin: 0 0 20px; font-size: 18px; color: #1a202c; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Recommended for You</h3>
      <div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 15px;">
        ${recommendedProducts.map(p => `
          <div style="flex: 1; min-width: 160px; background: #fff; border: 1px solid #edf2f7; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 15px;">
            <img src="${p.images && p.images[0] ? p.images[0] : 'https://via.placeholder.com/150'}" alt="${p.name}" style="width: 100%; height: 120px; object-fit: contain; margin-bottom: 10px; border-radius: 4px;">
            <div style="font-size: 13px; font-weight: 600; color: #1a202c; height: 36px; overflow: hidden; margin-bottom: 8px;">${p.name}</div>
            <div style="font-size: 14px; color: #e53e3e; font-weight: 700;">KSh ${p.price.toLocaleString()}</div>
            <a href="https://caseproz.co.ke/product/${p.slug}" style="display: inline-block; margin-top: 10px; padding: 6px 12px; background: #1a202c; color: #fff; text-decoration: none; font-size: 11px; border-radius: 4px; font-weight: 600;">VIEW ITEM</a>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CaseProz Order Confirmation</title>
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; padding: 10px !important; }
          .col-mobile { display: block !important; width: 100% !important; margin-bottom: 20px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7fafc; color: #2d3748;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f7fafc; padding: 20px 0;">
        <tr>
          <td align="center">
            <table class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 2px;">CASEPROZ</h1>
                  <div style="margin-top: 10px; height: 2px; width: 40px; background: #4a5568; margin-left: auto; margin-right: auto;"></div>
                  <p style="margin: 15px 0 0; color: #a0aec0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Confirmation</p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px; font-size: 22px; color: #1a202c;">Thank you for your order!</h2>
                  <p style="margin: 0 0 25px; line-height: 1.6; color: #4a5568;">
                    Hi ${user ? user.name.split(' ')[0] : 'there'}, we've received your order and it's being processed. Your order ID is <strong style="color: #1a202c;">#${order._id}</strong>.
                  </p>

                  <!-- Order Details -->
                  <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; border: 1px solid #edf2f7;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td class="col-mobile" width="50%" style="vertical-align: top;">
                          <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Shipping To</h4>
                          <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.4;">
                            ${user ? `<strong>${user.name}</strong><br>` : ''}
                            ${shippingText}
                          </p>
                        </td>
                        <td class="col-mobile" width="50%" style="vertical-align: top;">
                          <h4 style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Order Details</h4>
                          <p style="margin: 0; font-size: 14px; color: #2d3748; line-height: 1.4;">
                            Date: ${new Date(order.createdAt).toLocaleDateString()}<br>
                            Payment: ${order.paymentMethod || 'N/A'}<br>
                            Status: <span style="color: #3182ce; font-weight: 600;">${order.status.toUpperCase()}</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Items Table -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
                    <thead>
                      <tr>
                        <th style="text-align: left; padding: 12px; border-bottom: 2px solid #edf2f7; font-size: 13px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Item</th>
                        <th style="text-align: center; padding: 12px; border-bottom: 2px solid #edf2f7; font-size: 13px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Qty</th>
                        <th style="text-align: right; padding: 12px; border-bottom: 2px solid #edf2f7; font-size: 13px; text-transform: uppercase; color: #718096; letter-spacing: 0.5px;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRowsHtml}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="2" style="padding: 12px 12px 6px; text-align: right; color: #718096; font-size: 14px;">Subtotal</td>
                        <td style="padding: 12px 12px 6px; text-align: right; color: #1a202c; font-size: 14px; font-weight: 600;">KSh ${order.itemsPrice.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 6px 12px; text-align: right; color: #718096; font-size: 14px;">Shipping</td>
                        <td style="padding: 6px 12px; text-align: right; color: #1a202c; font-size: 14px; font-weight: 600;">KSh ${order.shippingPrice.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 6px 12px; text-align: right; color: #718096; font-size: 14px;">Tax</td>
                        <td style="padding: 6px 12px; text-align: right; color: #1a202c; font-size: 14px; font-weight: 600;">KSh ${order.taxPrice.toLocaleString()}</td>
                      </tr>
                      ${order.discountAmount > 0 ? `
                        <tr>
                          <td colspan="2" style="padding: 6px 12px; text-align: right; color: #38a169; font-size: 14px;">Discount ${order.discountCode ? `(${order.discountCode})` : ''}</td>
                          <td style="padding: 6px 12px; text-align: right; color: #38a169; font-size: 14px; font-weight: 600;">-KSh ${order.discountAmount.toLocaleString()}</td>
                        </tr>
                      ` : ''}
                      <tr>
                        <td colspan="2" style="padding: 15px 12px; text-align: right; font-size: 18px; font-weight: 800; color: #1a202c; border-top: 2px solid #edf2f7;">TOTAL</td>
                        <td style="padding: 15px 12px; text-align: right; font-size: 18px; font-weight: 800; color: #e53e3e; border-top: 2px solid #edf2f7;">KSh ${order.totalPrice.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <!-- Ads / CTA -->
                  <div style="background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%); border-radius: 8px; padding: 25px; text-align: center; color: #ffffff; margin-bottom: 20px;">
                    <h3 style="margin: 0 0 10px; font-size: 18px; font-weight: 700;">Join the CaseProz Community!</h3>
                    <p style="margin: 0 0 20px; font-size: 14px; color: #ccd0d5;">Get 10% off your next order when you refer a friend. Use code <strong style="color: #ffffff;">REFER10</strong></p>
                    <a href="https://caseproz.co.ke" style="display: inline-block; padding: 12px 25px; background: #ffffff; color: #1a202c; text-decoration: none; font-weight: 700; border-radius: 6px; font-size: 14px;">SHOP LATEST ARRIVALS</a>
                  </div>

                  <!-- Related Products -->
                  ${recommendedHtml}

                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 40px 30px; text-align: center; border-top: 1px solid #edf2f7;">
                  <div style="margin-bottom: 20px;">
                    <a href="#" style="margin: 0 10px; display: inline-block;"><img src="https://cdn-icons-png.flaticon.com/32/733/733547.png" width="24" height="24" alt="Facebook"></a>
                    <a href="#" style="margin: 0 10px; display: inline-block;"><img src="https://cdn-icons-png.flaticon.com/32/2111/2111463.png" width="24" height="24" alt="Instagram"></a>
                    <a href="#" style="margin: 0 10px; display: inline-block;"><img src="https://cdn-icons-png.flaticon.com/32/733/733579.png" width="24" height="24" alt="Twitter"></a>
                  </div>
                  <p style="margin: 0 0 10px; font-size: 12px; color: #718096;">
                    &copy; ${new Date().getFullYear()} CASEPROZ KENYA. All rights reserved.
                  </p>
                  <p style="margin: 0; font-size: 12px; color: #a0aec0; line-height: 1.6;">
                    Kenya's premium electronics destination.<br>
                    Nairobi, Kenya | support@caseproz.co.ke<br>
                    <a href="https://caseproz.co.ke/unsubscribe" style="color: #a0aec0; text-decoration: underline;">Unsubscribe</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = {
  generateOrderConfirmationEmail,
};
