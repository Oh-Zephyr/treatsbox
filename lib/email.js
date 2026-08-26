// Order confirmation emails via Resend. Best-effort only: a failed or
// unconfigured email must never block order creation -- the order itself
// is already saved and queued by the time this runs. Callers should always
// wrap this in try/catch (or just not await it strictly) and log, not throw.

const RESEND_API_KEY = process.env.RESEND_API_KEY || null;

// Falls back to Resend's shared test sender until a domain is verified in
// Resend (see README) -- that sender can only deliver to the Resend
// account's own email address, not real customers, until then.
const FROM_ADDRESS = process.env.RESEND_FROM_ADDRESS || "Treatsbox <onboarding@resend.dev>";

export function emailConfigured() {
  return !!RESEND_API_KEY;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendOrderConfirmationEmail(order, formatNaira) {
  if (!emailConfigured()) return { skipped: true, reason: "not-configured" };
  if (!order.email) return { skipped: true, reason: "no-email" };

  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:6px 0;color:#4A3A2A;font-size:14px;">${escapeHtml(item.itemName)} × ${item.quantity}</td><td style="padding:6px 0;text-align:right;color:#241B14;font-size:14px;">${formatNaira(item.total)}</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#FBF3E7;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FBF3E7;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;">
<tr><td style="padding:32px;">
<p style="margin:0 0 4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#A97A2E;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">Order Confirmed</p>
<h1 style="margin:0 0 16px;font-size:26px;color:#241B14;font-family:Georgia,serif;">You're in the queue!</h1>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#4A3A2A;font-family:Arial,Helvetica,sans-serif;">
Thanks for your order, ${escapeHtml(order.customerName)}. Here are your details:
</p>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F1E3C8;border-radius:12px;margin-bottom:20px;">
<tr><td style="padding:16px 20px;">
<p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#4A3A2A;font-family:Arial,Helvetica,sans-serif;">Order Number</p>
<p style="margin:2px 0 0;font-size:22px;font-weight:bold;color:#241B14;font-family:Georgia,serif;">${escapeHtml(order.orderNumber)}</p>
</td></tr>
</table>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
${itemsHtml}
<tr><td style="padding-top:10px;border-top:1px solid #E6D6BE;font-size:15px;font-weight:bold;color:#241B14;font-family:Arial,Helvetica,sans-serif;">Grand Total</td><td style="padding-top:10px;border-top:1px solid #E6D6BE;text-align:right;font-size:15px;font-weight:bold;color:#241B14;font-family:Arial,Helvetica,sans-serif;">${formatNaira(order.grandTotal)}</td></tr>
</table>
<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#4A3A2A;font-family:Arial,Helvetica,sans-serif;">
Your payment is <strong>${escapeHtml(order.paymentStatus)}</strong>. Upload your receipt on the order page any time to speed up verification.
</p>
<p style="margin:0;font-size:13px;color:#6B5645;font-family:Arial,Helvetica,sans-serif;">
Keep this order number handy — you can look up your order status any time using it.
</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = `You're in the queue!\n\nOrder Number: ${order.orderNumber}\n\n${order.items.map((i) => `${i.itemName} x${i.quantity} - ${formatNaira(i.total)}`).join("\n")}\n\nGrand Total: ${formatNaira(order.grandTotal)}\n\nPayment status: ${order.paymentStatus}\nKeep this order number handy to check your status any time.`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: order.email,
        subject: `Order Confirmed — ${order.orderNumber}`,
        html,
        text
      })
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`Order confirmation email failed (${res.status}):`, body);
      return { skipped: false, ok: false, status: res.status };
    }
    return { skipped: false, ok: true };
  } catch (err) {
    console.error("Order confirmation email failed:", err);
    return { skipped: false, ok: false, error: String(err) };
  }
}
