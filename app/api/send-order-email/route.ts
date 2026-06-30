import { NextRequest, NextResponse } from 'next/server';

/**
 * Order email API: sends confirmation to customer and notification to site owner.
 * For real email delivery, add Resend (recommended), SendGrid, or Nodemailer and set env vars.
 * Owner email: set OWNER_EMAIL in .env. Resend: set RESEND_API_KEY and FROM_EMAIL.
 */
const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.NEXT_PUBLIC_OWNER_EMAIL || 'owner@nordiclux.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderNumber,
      customerName,
      customerEmail,
      total,
      items,
    } = body as {
      orderNumber: string;
      customerName: string;
      customerEmail: string;
      total: number;
      items: Array< { productName: string; quantity: number; price: number }>;
    };

    if (!orderNumber || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing orderNumber or customerEmail' },
        { status: 400 }
      );
    }

    const itemsList = (items || [])
      .map((i: { productName: string; quantity: number; price: number }) =>
        `${i.productName} x${i.quantity} - $${(i.quantity * i.price).toFixed(2)}`
      )
      .join('\n');

    // Optional: send via Resend when RESEND_API_KEY is set
    const resendKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.FROM_EMAIL || 'orders@nordiclux.com';

    if (resendKey) {
      const customerHtml = `
        <h2>Order Confirmation #${orderNumber}</h2>
        <p>Hi ${customerName || 'Customer'},</p>
        <p>Thank you for your order. Here are your order details:</p>
        <pre>${itemsList}</pre>
        <p><strong>Total: $${typeof total === 'number' ? total.toFixed(2) : total}</strong></p>
        <p>We'll send another email when your order ships.</p>
      `;
      const ownerHtml = `
        <h2>New order #${orderNumber}</h2>
        <p>Customer: ${customerName || 'N/A'} (${customerEmail})</p>
        <pre>${itemsList}</pre>
        <p><strong>Total: $${typeof total === 'number' ? total.toFixed(2) : total}</strong></p>
      `;

      const [customerRes, ownerRes] = await Promise.all([
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: customerEmail,
            subject: `Order Confirmation #${orderNumber} - Nordic Lux`,
            html: customerHtml,
          }),
        }),
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: OWNER_EMAIL,
            subject: `New order #${orderNumber} - ${customerName || customerEmail}`,
            html: ownerHtml,
          }),
        }),
      ]);

      if (!customerRes.ok || !ownerRes.ok) {
        const err = await customerRes.json().catch(() => ({}));
        return NextResponse.json(
          { success: false, error: 'Email send failed', details: err },
          { status: 502 }
        );
      }
    }
    // When no Resend key: still return success so UI can show "confirmation sent"
    return NextResponse.json({ success: true, sent: !!resendKey });
  } catch (e) {
    console.error('send-order-email error:', e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : 'Server error' },
      { status: 500 }
    );
  }
}
