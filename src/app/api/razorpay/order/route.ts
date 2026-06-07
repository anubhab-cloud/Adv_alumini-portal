import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount specified." }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SuvDD9siyulFm8";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "pNPY0BztUhf8KTlByE7zQtsb";

    // Encode credentials for HTTP Basic Authentication
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // convert INR to Paise
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Razorpay Order Creation API Error:", errText);
      return NextResponse.json({ error: "Failed to create secure Razorpay order ID." }, { status: 500 });
    }

    const orderData = await response.json();
    return NextResponse.json(orderData);
  } catch (error: any) {
    console.error("Order Handler Error:", error);
    return NextResponse.json({ error: error.message || "Internal server order error" }, { status: 500 });
  }
}
