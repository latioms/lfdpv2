import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = `noreply@dev.latioms.co`;

export async function POST(req: Request) {
  try {
    const { recipient, subject, content } = await req.json();

    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: recipient,
      subject: subject,
      html: content,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}