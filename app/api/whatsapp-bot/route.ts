import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'nordiclux_verify_2025';

// Nordic Lux product catalog for the bot context
const PRODUCT_CATALOG = `
NORDIC LUX PRODUCT CATALOG
===========================

THE ORDINARY PRODUCTS:
1. Niacinamide 10% + Zinc 1% - $8.90 - 30ml - Stock: 4 - For: Oily, Acne-Prone, Blemish Control, Pore Minimizing
2. 100% Niacinamide Powder - $6.90 - 20g - Stock: 2 - For: Oily Skin, Blemish Control, Customizable, Brightening
3. Caffeine Solution 5% + EGCG - $7.90 - 30ml - Stock: 2 - For: Dark Circles, Puffiness, Eye Care
4. Hyaluronic Acid 2% + B5 (with Ceramides) - $10.90 - 30ml - Stock: 2 - For: Dry Skin, Hydration, Barrier Repair
5. Hyaluronic Acid 2% + B5 - $9.90 - 30ml/60ml - Stock: 3 - For: Dehydrated Skin, Hydration, Plumping
6. Salicylic Acid 0.5% Body Serum - $12.90 - 240ml - Stock: 2 - For: Acne-Prone Body, Keratosis Pilaris, Exfoliating
7. Glycolic Acid 7% Exfoliating Toner - $11.90 - 240ml - Stock: 3 - For: Normal/Oily/Combination Skin, Exfoliating, Brightening
8. Azelaic Acid Suspension 10% - $9.90 - 30ml - Stock: 2 - For: Oily, Acne-Prone, Sensitive Skin, Brightening, Redness
9. Natural Moisturizing Factors + HA - $8.90 - 30ml/100ml - Stock: 1 - For: Dry, Sensitive Skin, Hydration, Barrier Repair
10. Natural Moisturizing Factors + PhytoCeramides - $10.90 - 100ml - Stock: 2 - For: Dry, Sensitive Skin, Barrier Repair, Anti-Aging
11. Natural Moisturizing Factors + Beta Glucan - $10.90 - 30ml - Stock: 2 - For: Sensitive Skin, Redness, Hydration, Soothing
12. Squalane Cleanser - $9.90 - 50ml - Stock: 3 - For: All Skin Types, Gentle Cleansing, Makeup Removal
13. Squalane + Amino Acids Lip Balm - $6.90 - 7ml - Stock: 5 - For: Dry Lips, Hydration, Plumping
14. AHA 30% + BHA 2% Peeling Solution - $14.90 - 30ml - Stock: 2 - For: Dull Skin, Uneven Texture, Exfoliating (Weekly use)
15. Retinol 0.5% in Squalane - $11.90 - 30ml - Stock: 2 - For: Anti-Aging, Fine Lines, Wrinkles, Skin Renewal
16. Multi-Peptide Eye Serum - $17.90 - 15ml - Stock: 2 - For: Eye Area, Dark Circles, Puffiness, Anti-Aging
17. Multi-Peptide Serum for Hair Density - $19.90 - 60ml - Stock: 1 - For: Thinning Hair, Hair Density, Scalp Health
18. UV Filters SPF 45 Serum - $13.90 - 30ml - Stock: 3 - For: Sun Protection, Daily Use, Lightweight
19. Soothing & Barrier Support Serum - $12.90 - 30ml - Stock: 2 - For: Sensitive Skin, Redness, Barrier Repair, Calming
20. Acne Set (Niacinamide + Salicylic Acid) - $18.90 - Set - Stock: 2 - For: Acne-Prone, Oily Skin, Blemish Control

CERAVE PRODUCTS:
21. Moisturizing Cream - $18.90 - 340g - Stock: 3 - For: Dry/Very Dry Skin, Eczema, Intense Hydration
22. Moisturizing Lotion - $16.90 - 236ml - Stock: 4 - For: Dry/Normal Skin, Daily Moisturizing
23. Facial Moisturizing Lotion PM - $17.90 - 60ml - Stock: 3 - For: Normal/Dry Skin, Nighttime, Niacinamide
24. Facial Moisturizing Lotion AM SPF 50 - $19.90 - 60ml - Stock: 2 - For: Daily Sun Protection, Lightweight
25. Eye Repair Cream - $21.90 - 14ml - Stock: 2 - For: Dark Circles, Puffiness, Eye Area
26. Advanced Repair Ointment - $15.90 - 88ml - Stock: 2 - For: Very Dry/Cracked Skin, Healing, Protective
27. Hydrating Cream-to-Foam Cleanser - $14.90 - 236ml - Stock: 3 - For: Normal/Dry Skin, Gentle Cleansing
28. Foaming Cleanser - $13.90 - 236ml - Stock: 4 - For: Normal/Oily Skin, Deep Cleansing
29. Hydrating Cleanser - $12.90 - 236ml - Stock: 5 - For: Dry/Sensitive Skin, Gentle, Non-Foaming
30. Hydrating Foaming Oil Cleanser - $15.90 - 236ml - Stock: 2 - For: Dry/Very Dry Skin, Makeup Removal
31. Blemish Control Cleanser - $14.90 - 236ml - Stock: 3 - For: Acne-Prone, Oily Skin, Salicylic Acid
32. SA Smoothing Cleanser - $13.90 - 236ml - Stock: 3 - For: Rough/Bumpy Skin, Exfoliating, Salicylic Acid
33. SA Smoothing Cream - $19.90 - 340g - Stock: 2 - For: Rough/Bumpy Skin, Keratosis Pilaris, Salicylic Acid

STORE INFO:
- Website: https://thnordiclux.vercel.app
- WhatsApp: +94770130299
- All products are authentic, imported from US/UK/Canada
- Free shipping on orders over $50
- Orders placed via the website
`;

async function generateAIReply(userMessage: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a friendly and helpful customer support assistant for Nordic Lux, a premium skincare store in Sri Lanka that sells authentic products from The Ordinary and CeraVe.

Your role is to:
1. Answer questions about product availability and stock levels
2. Provide pricing information
3. Suggest suitable products based on skin type or concerns
4. Explain what products do and how to use them
5. Help customers find the right product for their needs

IMPORTANT RULES:
- Be warm, friendly, and professional
- Keep responses concise and easy to read (use emojis sparingly)
- Always mention the product name and price when discussing specific products
- If stock is 1-2 units, mention "limited stock available - order soon!"
- For skincare advice, always recommend consulting a dermatologist for serious conditions
- Direct customers to the website https://thnordiclux.vercel.app to place orders
- Respond in the same language the customer uses (English or Sinhala)
- Keep responses under 300 words

Here is the complete product catalog with current stock and prices:
${PRODUCT_CATALOG}`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content ||
      'Hi! Thank you for contacting Nordic Lux 🌿 Our team will get back to you shortly. Browse our products at https://thnordiclux.vercel.app';
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Hi! Thank you for contacting Nordic Lux 🌿 We\'ll get back to you shortly. Browse our products at https://thnordiclux.vercel.app';
  }
}

async function sendWhatsAppMessage(to: string, message: string) {
  const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: { body: message },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('WhatsApp send error:', error);
  }

  return response;
}

// GET: Webhook verification by Meta
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// POST: Receive incoming WhatsApp messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract message from Meta webhook payload
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      // Could be a status update, just acknowledge
      return NextResponse.json({ status: 'ok' });
    }

    const message = messages[0];
    const from = message.from; // Customer's WhatsApp number
    const messageType = message.type;

    // Only handle text messages
    if (messageType !== 'text') {
      await sendWhatsAppMessage(
        from,
        'Hi! I can only respond to text messages right now. Please type your question and I\'ll be happy to help! 😊'
      );
      return NextResponse.json({ status: 'ok' });
    }

    const userText = message.text?.body || '';

    if (!userText.trim()) {
      return NextResponse.json({ status: 'ok' });
    }

    // Generate AI response
    const aiReply = await generateAIReply(userText);

    // Send reply back to customer
    await sendWhatsAppMessage(from, aiReply);

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp bot error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
