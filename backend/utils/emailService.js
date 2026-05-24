const { Resend } = require("resend");

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

function guardEnv() {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    console.warn("[Email] RESEND_API_KEY / RESEND_FROM_EMAIL not set — skipping email.");
    return false;
  }
  return true;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function emailHeader(iconEmoji, title, subtitle) {
  return `
  <tr>
    <td style="background:linear-gradient(135deg,#15803d 0%,#166534 60%,#14532d 100%);padding:40px 40px 32px;text-align:center;">
      <div style="font-size:52px;line-height:1;margin-bottom:12px;">${iconEmoji}</div>
      <h1 style="margin:0 0 4px;color:#fbbf24;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Aam-e-Khaas</h1>
      <p style="margin:0;color:#bbf7d0;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:500;">Premium Mango Store</p>
    </td>
  </tr>
  <tr>
    <td style="background:${title.bg};border-bottom:3px solid ${title.border};padding:24px 40px;text-align:center;">
      <h2 style="margin:0 0 8px;color:${title.headingColor};font-size:22px;font-weight:700;">${title.heading}</h2>
      <p style="margin:0;color:${title.textColor};font-size:15px;line-height:1.6;">${subtitle}</p>
    </td>
  </tr>`;
}

function emailFooter() {
  return `
  <tr>
    <td style="padding:28px 40px 32px;text-align:center;border-top:2px solid #d1fae5;">
      <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Questions? Reply to this email or contact our support team.</p>
      <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Aam-e-Khaas · Premium Mango Store</p>
    </td>
  </tr>`;
}

function itemTable(items) {
  const rows = items.map((item) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f0fdf4;">
        <span style="font-size:14px;color:#14532d;font-weight:600;">${item.name}</span>
      </td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0fdf4;text-align:center;color:#166534;font-size:14px;">${item.quantity}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0fdf4;text-align:right;color:#166534;font-size:14px;">Rs ${item.price.toLocaleString()}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #f0fdf4;text-align:right;font-weight:700;color:#d97706;font-size:14px;">Rs ${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`).join("");

  return `
  <tr>
    <td style="padding:24px 40px 0;">
      <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#14532d;text-transform:uppercase;letter-spacing:1px;">🛒 Your Items</h3>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1.5px solid #d1fae5;border-radius:12px;overflow:hidden;">
        <tr style="background:#15803d;">
          <th style="padding:11px 16px;text-align:left;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;">Product</th>
          <th style="padding:11px 16px;text-align:center;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;">Qty</th>
          <th style="padding:11px 16px;text-align:right;color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;">Price</th>
          <th style="padding:11px 16px;text-align:right;color:#fbbf24;font-size:12px;font-weight:700;text-transform:uppercase;">Total</th>
        </tr>
        ${rows}
      </table>
    </td>
  </tr>`;
}

function priceSummary(subtotal, deliveryFee, grandTotal) {
  return `
  <tr>
    <td style="padding:20px 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;color:#166534;font-size:14px;">Subtotal</td>
          <td style="padding:6px 0;text-align:right;color:#166534;font-size:14px;font-weight:600;">Rs ${subtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#166534;font-size:14px;">Delivery Fee</td>
          <td style="padding:6px 0;text-align:right;color:#166534;font-size:14px;font-weight:600;">Rs ${deliveryFee.toLocaleString()}</td>
        </tr>
        <tr><td colspan="2" style="padding:8px 0;"><hr style="border:none;border-top:2px solid #d1fae5;margin:0;"/></td></tr>
        <tr>
          <td style="padding:6px 0;color:#14532d;font-size:17px;font-weight:800;">Grand Total</td>
          <td style="padding:6px 0;text-align:right;color:#d97706;font-size:20px;font-weight:900;">Rs ${grandTotal.toLocaleString()}</td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function wrapEmail(innerRows) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(21,128,61,0.12);">
        ${innerRows}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Template 1: Order Confirmed ───────────────────────────────────────────────

function buildConfirmedHTML({ customerName, orderId, items, subtotal, deliveryFee, grandTotal, shippingAddress }) {
  const trackingId = String(orderId).toUpperCase();

  const rows = `
    ${emailHeader("🥭", {
      bg: "#fef9c3", border: "#fde68a",
      heading: `Shukriya, ${customerName}! 🎉`,
      headingColor: "#92400e", textColor: "#78350f"
    }, `Thank you for showing your love for <strong>Aam-e-Khaas</strong> and satisfying your mango cravings with us.<br/>Your order has been <strong>confirmed</strong> and is now being prepared with care. 🌿`)}

    <tr>
      <td style="padding:28px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px dashed #86efac;border-radius:14px;">
          <tr>
            <td style="padding:18px 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Order / Tracking ID</p>
              <p style="margin:0;font-size:17px;font-weight:800;color:#14532d;letter-spacing:1px;word-break:break-all;">#${trackingId}</p>
            </td>
            <td style="padding:18px 24px;text-align:right;">
              <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;border:1.5px solid #86efac;">✅ Confirmed</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding:20px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;">
          <tr>
            <td style="padding:16px 20px;">
              <p style="margin:0 0 6px;font-size:11px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">📦 Delivering To</p>
              <p style="margin:0;font-size:14px;color:#7c2d12;font-weight:600;">${shippingAddress.address}, ${shippingAddress.city}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#9a3412;">📞 ${shippingAddress.phone}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${itemTable(items)}
    ${priceSummary(subtotal, deliveryFee, grandTotal)}

    <tr>
      <td style="padding:28px 40px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:#4ade80;background:#14532d;border-radius:10px;padding:14px 20px;line-height:1.7;">
          🌟 We handpick the finest mangoes so every bite feels like a blessing.<br/>
          <strong style="color:#fbbf24;">Aam-e-Khaas</strong> — because you deserve only the best. 🥭
        </p>
      </td>
    </tr>

    ${emailFooter()}`;

  return wrapEmail(rows);
}

// ── Template 2: Order Cancelled ───────────────────────────────────────────────

function buildCancelledHTML({ customerName, orderId, items, subtotal, deliveryFee, grandTotal }) {
  const trackingId = String(orderId).toUpperCase();

  const rows = `
    ${emailHeader("😔", {
      bg: "#fef2f2", border: "#fecaca",
      heading: `We're sorry, ${customerName}.`,
      headingColor: "#991b1b", textColor: "#7f1d1d"
    }, `Your order <strong>#${trackingId}</strong> has been <strong>cancelled</strong>.<br/>If you have any questions, please don't hesitate to reach out to us.`)}

    <tr>
      <td style="padding:28px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:2px dashed #fca5a5;border-radius:14px;">
          <tr>
            <td style="padding:18px 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#dc2626;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Cancelled Order ID</p>
              <p style="margin:0;font-size:17px;font-weight:800;color:#7f1d1d;letter-spacing:1px;word-break:break-all;">#${trackingId}</p>
            </td>
            <td style="padding:18px 24px;text-align:right;">
              <span style="display:inline-block;background:#fee2e2;color:#dc2626;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;border:1.5px solid #fca5a5;">❌ Cancelled</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${itemTable(items)}
    ${priceSummary(subtotal, deliveryFee, grandTotal)}

    <tr>
      <td style="padding:28px 40px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:#fbbf24;background:#7f1d1d;border-radius:10px;padding:14px 20px;line-height:1.7;">
          🥭 Your mango cravings deserve to be fulfilled!<br/>
          <strong style="color:#fde68a;">Aam-e-Khaas</strong> — We hope to serve you again soon.
        </p>
      </td>
    </tr>

    ${emailFooter()}`;

  return wrapEmail(rows);
}

// ── Template 3: Order Delivered ───────────────────────────────────────────────

function buildDeliveredHTML({ customerName, orderId, items, subtotal, deliveryFee, grandTotal }) {
  const trackingId = String(orderId).toUpperCase();

  const rows = `
    ${emailHeader("🎊", {
      bg: "#f0fdf4", border: "#86efac",
      heading: `Your order arrived, ${customerName}! 🥭`,
      headingColor: "#14532d", textColor: "#166534"
    }, `Order <strong>#${trackingId}</strong> has been <strong>delivered</strong> successfully.<br/>We hope you enjoy every juicy bite! Thank you for choosing <strong>Aam-e-Khaas</strong>. 🌿`)}

    <tr>
      <td style="padding:28px 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:2px dashed #4ade80;border-radius:14px;">
          <tr>
            <td style="padding:18px 24px;">
              <p style="margin:0 0 4px;font-size:11px;color:#16a34a;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Delivered Order ID</p>
              <p style="margin:0;font-size:17px;font-weight:800;color:#14532d;letter-spacing:1px;word-break:break-all;">#${trackingId}</p>
            </td>
            <td style="padding:18px 24px;text-align:right;">
              <span style="display:inline-block;background:#dcfce7;color:#15803d;font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;border:1.5px solid #4ade80;">📦 Delivered</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    ${itemTable(items)}
    ${priceSummary(subtotal, deliveryFee, grandTotal)}

    <tr>
      <td style="padding:28px 40px 0;text-align:center;">
        <p style="margin:0;font-size:14px;color:#4ade80;background:#14532d;border-radius:10px;padding:14px 20px;line-height:1.7;">
          🌟 We hope the mangoes brought a smile to your face!<br/>
          <strong style="color:#fbbf24;">Aam-e-Khaas</strong> — Come back for more freshness. 🥭
        </p>
      </td>
    </tr>

    ${emailFooter()}`;

  return wrapEmail(rows);
}

// ── Send functions ────────────────────────────────────────────────────────────

async function sendOrderConfirmed({ customerName, customerEmail, orderId, items, subtotal, deliveryFee, grandTotal, shippingAddress }) {
  if (!guardEnv()) return;
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: `Aam-e-Khaas <${process.env.RESEND_FROM_EMAIL}>`,
    to: customerEmail,
    subject: `Order Confirmed - Tracking ID #${String(orderId).toUpperCase()}`,
    html: buildConfirmedHTML({ customerName, orderId, items, subtotal, deliveryFee, grandTotal, shippingAddress })
  });
  if (error) throw new Error(error.message);
  console.log(`[Email] Confirmation sent to ${customerEmail}`);
}

async function sendOrderCancelled({ customerName, customerEmail, orderId, items, subtotal, deliveryFee, grandTotal }) {
  if (!guardEnv()) return;
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: `Aam-e-Khaas <${process.env.RESEND_FROM_EMAIL}>`,
    to: customerEmail,
    subject: `Order Cancelled - #${String(orderId).toUpperCase()}`,
    html: buildCancelledHTML({ customerName, orderId, items, subtotal, deliveryFee, grandTotal })
  });
  if (error) throw new Error(error.message);
  console.log(`[Email] Cancellation sent to ${customerEmail}`);
}

async function sendOrderDelivered({ customerName, customerEmail, orderId, items, subtotal, deliveryFee, grandTotal }) {
  if (!guardEnv()) return;
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: `Aam-e-Khaas <${process.env.RESEND_FROM_EMAIL}>`,
    to: customerEmail,
    subject: `Order Delivered - #${String(orderId).toUpperCase()}`,
    html: buildDeliveredHTML({ customerName, orderId, items, subtotal, deliveryFee, grandTotal })
  });
  if (error) throw new Error(error.message);
  console.log(`[Email] Delivery notice sent to ${customerEmail}`);
}

async function testEmailConnection(toEmail) {
  if (!guardEnv()) return;
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: `Aam-e-Khaas <${process.env.RESEND_FROM_EMAIL}>`,
    to: toEmail,
    subject: "Email Test - Aam-e-Khaas",
    html: "<h2 style='color:#15803d'>Email is working! 🥭</h2><p>Your Resend setup is configured correctly.</p>"
  });
  if (error) throw new Error(error.message);
  console.log(`[Email] Test email sent to ${toEmail}`);
}

module.exports = { sendOrderConfirmed, sendOrderCancelled, sendOrderDelivered, testEmailConnection };
