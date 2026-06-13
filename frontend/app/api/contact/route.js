import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { name, email, city, inquiryType, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailHeader = `
      <tr>
        <td style="background:linear-gradient(135deg,#15803d 0%,#166534 60%,#14532d 100%);padding:40px 40px 32px;text-align:center;">
          <div style="font-size:52px;line-height:1;margin-bottom:12px;">🌿</div>
          <h1 style="margin:0 0 4px;color:#fbbf24;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Aam-e-Khaas</h1>
          <p style="margin:0;color:#bbf7d0;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:500;">Premium Mango Store</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f0fdf4;border-bottom:3px solid #86efac;padding:24px 40px;text-align:center;">
          <h2 style="margin:0 0 8px;color:#14532d;font-size:22px;font-weight:700;">New Contact Inquiry</h2>
          <p style="margin:0;color:#166534;font-size:15px;line-height:1.6;">A customer has submitted a message via the website contact form.</p>
        </td>
      </tr>
    `;

    const emailFooter = `
      <tr>
        <td style="padding:28px 40px 32px;text-align:center;border-top:2px solid #d1fae5;background-color:#ffffff;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Aam-e-Khaas · Premium Mango Store</p>
        </td>
      </tr>
    `;

    const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(21,128,61,0.12);">
        ${emailHeader}
        
        <tr>
          <td style="padding:28px 40px 0;background-color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1.5px solid #fed7aa;border-radius:12px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:11px;color:#c2410c;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">👤 Customer Details</p>
                  <p style="margin:0;font-size:14px;color:#7c2d12;font-weight:600;"><span style="color:#9a3412;font-weight:normal;">Name:</span> ${name}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7c2d12;font-weight:600;"><span style="color:#9a3412;font-weight:normal;">Email:</span> ${email}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7c2d12;font-weight:600;"><span style="color:#9a3412;font-weight:normal;">City:</span> ${city}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#7c2d12;font-weight:600;"><span style="color:#9a3412;font-weight:normal;">Inquiry Type:</span> ${inquiryType}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:24px 40px 0;background-color:#ffffff;">
            <h3 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#14532d;text-transform:uppercase;letter-spacing:1px;">✉️ Message Content</h3>
            <div style="background:#f0fdf4;border:1.5px solid #d1fae5;border-radius:12px;padding:20px;color:#14532d;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</div>
          </td>
        </tr>

        <tr style="background-color:#ffffff;"><td style="height:28px;"></td></tr>
        ${emailFooter}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: `Aam-e-Khaas <${process.env.RESEND_FROM_EMAIL || "orders@aam-e-khaas.shop"}>`,
      to: process.env.CONTACT_RECEIVER_EMAIL || "ammekhaas@gmail.com",
      replyTo: email,
      subject: `Inquiry: ${inquiryType} from ${name}`,
      html: htmlBody
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
