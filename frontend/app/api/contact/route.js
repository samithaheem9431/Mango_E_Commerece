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

    const { data, error } = await resend.emails.send({
      from: "Mango Luxury <onboarding@resend.dev>",
      to: process.env.CONTACT_RECEIVER_EMAIL || "delivered@resend.dev",
      subject: `New Luxury Inquiry: ${inquiryType} from ${name}`,
      html: `
        <div style="font-family: serif; color: #0A0A0A; padding: 20px; border: 1px solid #D4AF37; background-color: #fdfdfd;">
          <h2 style="color: #996515; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Reach the Kings of Mangoes - New Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>City:</strong> ${city}</p>
          <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
          <div style="margin-top: 20px; padding: 15px; background: #fafafa; border-left: 4px solid #D4AF37;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <footer style="margin-top: 30px; font-size: 12px; color: #666;">
            Sent from Mango Luxury Export Brand Website
          </footer>
        </div>
      `,
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
