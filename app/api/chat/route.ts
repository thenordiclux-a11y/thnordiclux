import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PRODUCT_CATALOG = `
NORDIC LUX PRODUCT CATALOG
===========================

THE ORDINARY PRODUCTS:
1. Niacinamide 10% + Zinc 1% - $8.90 - 30ml - Stock: 4 - Skin: Oily, Acne-Prone, Pore Minimizing, Blemish Control
2. 100% Niacinamide Powder - $6.90 - 20g - Stock: 2 - Skin: Oily, Brightening, Customizable
3. Caffeine Solution 5% + EGCG - $7.90 - 30ml - Stock: 2 - Skin: Dark Circles, Puffiness, Eye Care
4. Hyaluronic Acid 2% + B5 (with Ceramides) - $10.90 - 30ml - Stock: 2 - Skin: Dry, Hydration, Barrier Repair
5. Hyaluronic Acid 2% + B5 - $9.90 - 30ml/60ml - Stock: 3 - Skin: Dehydrated, Hydration, Plumping
6. Salicylic Acid 0.5% Body Serum - $12.90 - 240ml - Stock: 2 - Skin: Acne-Prone Body, Keratosis Pilaris
7. Glycolic Acid 7% Exfoliating Toner - $11.90 - 240ml - Stock: 3 - Skin: Normal/Oily/Combination, Brightening
8. Azelaic Acid Suspension 10% - $9.90 - 30ml - Stock: 2 - Skin: Oily, Acne-Prone, Sensitive, Redness
9. Natural Moisturizing Factors + HA - $8.90 - 30ml/100ml - Stock: 1 - Skin: Dry, Sensitive, Barrier Repair
10. Natural Moisturizing Factors + PhytoCeramides - $10.90 - 100ml - Stock: 2 - Skin: Dry, Sensitive, Anti-Aging
11. Natural Moisturizing Factors + Beta Glucan - $10.90 - 30ml - Stock: 2 - Skin: Sensitive, Redness, Soothing
12. Squalane Cleanser - $9.90 - 50ml - Stock: 3 - Skin: All Types, Gentle Cleansing, Makeup Removal
13. Squalane + Amino Acids Lip Balm - $6.90 - 7ml - Stock: 5 - Skin: Dry Lips, Hydration
14. AHA 30% + BHA 2% Peeling Solution - $14.90 - 30ml - Stock: 2 - Skin: Dull, Uneven Texture (Weekly use only)
15. Retinol 0.5% in Squalane - $11.90 - 30ml - Stock: 2 - Skin: Anti-Aging, Fine Lines, Wrinkles
16. Multi-Peptide Eye Serum - $17.90 - 15ml - Stock: 2 - Skin: Eye Area, Dark Circles, Anti-Aging
17. Multi-Peptide Serum for Hair Density - $19.90 - 60ml - Stock: 1 - Hair: Thinning, Density, Scalp Health
18. UV Filters SPF 45 Serum - $13.90 - 30ml - Stock: 3 - Skin: Sun Protection, Daily Use
19. Soothing & Barrier Support Serum - $12.90 - 30ml - Stock: 2 - Skin: Sensitive, Redness, Calming
20. Acne Set (Niacinamide + Salicylic Acid) - $18.90 - Set - Stock: 2 - Skin: Acne-Prone, Oily

CERAVE PRODUCTS:
21. Moisturizing Cream - $18.90 - 340g - Stock: 3 - Skin: Dry/Very Dry, Eczema, Intense Hydration
22. Moisturizing Lotion - $16.90 - 236ml - Stock: 4 - Skin: Dry/Normal, Daily Moisturizing
23. Facial Moisturizing Lotion PM - $17.90 - 60ml - Stock: 3 - Skin: Normal/Dry, Nighttime
24. Facial Moisturizing Lotion AM SPF 50 - $19.90 - 60ml - Stock: 2 - Skin: Daily Sun Protection
25. Eye Repair Cream - $21.90 - 14ml - Stock: 2 - Skin: Dark Circles, Puffiness, Eye Area
26. Advanced Repair Ointment - $15.90 - 88ml - Stock: 2 - Skin: Very Dry/Cracked, Healing
27. Hydrating Cream-to-Foam Cleanser - $14.90 - 236ml - Stock: 3 - Skin: Normal/Dry, Gentle
28. Foaming Cleanser - $13.90 - 236ml - Stock: 4 - Skin: Normal/Oily, Deep Cleansing
29. Hydrating Cleanser - $12.90 - 236ml - Stock: 5 - Skin: Dry/Sensitive, Gentle, Non-Foaming
30. Hydrating Foaming Oil Cleanser - $15.90 - 236ml - Stock: 2 - Skin: Dry/Very Dry, Makeup Removal
31. Blemish Control Cleanser - $14.90 - 236ml - Stock: 3 - Skin: Acne-Prone, Oily, Salicylic Acid
32. SA Smoothing Cleanser - $13.90 - 236ml - Stock: 3 - Skin: Rough/Bumpy, Exfoliating
33. SA Smoothing Cream - $19.90 - 340g - Stock: 2 - Skin: Rough/Bumpy, Keratosis Pilaris

STORE INFO:
- Website: https://thnordiclux.vercel.app
- WhatsApp: +94770130299
- All products are authentic, imported
- Free shipping on orders over $50
- Place orders via the website
`;

const SYSTEM_PROMPT = `You are a friendly and knowledgeable AI assistant for Nordic Lux, a premium skincare store. You help customers find the right products, check availability and prices, and give personalized skincare recommendations.

Your personality:
- Warm, friendly, and professional
- Knowledgeable about skincare
- Concise but helpful (keep replies under 200 words)
- Use line breaks to make responses easy to read
- Use occasional emojis to be friendly (not excessive)

Your capabilities:
- Answer questions about product availability and stock
- Provide pricing information
- Recommend products based on skin type or concerns
- Explain product benefits and how to use them
- Help customers decide between products

Important rules:
- Always mention price when discussing a specific product
- If stock is 1-2 units, say "limited stock - order soon!"
- Direct customers to https://thnordiclux.vercel.app to place orders
- For serious skin conditions, recommend consulting a dermatologist
- If asked about something not in the catalog, say it's not currently available

Here is the complete product catalog:
${PRODUCT_CATALOG}`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10), // Keep last 10 messages for context
      ],
      max_tokens: 350,
      temperature: 0.7,
    });

    const message = completion.choices[0]?.message?.content ||
      'Sorry, I couldn\'t process that. Please try again or contact us on WhatsApp at +94770130299 😊';

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { message: 'I\'m having trouble connecting right now. Please try again shortly or reach us on WhatsApp at +94770130299 😊' },
      { status: 200 }
    );
  }
}
