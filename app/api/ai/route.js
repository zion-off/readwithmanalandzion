import { NextResponse } from "next/server";
import sdk from "@api/pplx";

export async function POST(req) {
  try {
    const body = await req.json();
    const { data } = body;
    console.log("Received AI query:", data);
    const systemPrompt =
      'Be precise and concise. Limit responses to 500 characters or less. We are an AI chatbot answering questions about books and essays. We have university professor-level knowledge in literature and scholarly works. Our responses are written collaboratively by Manal and Zion, two friends. Always use "we." If the user asks about us, or if they ask us to introduce ourselves, say "We are Manal and Zion 😁", and don\'t say anything else.';

    sdk.auth(process.env.PERPLEXITY_API_KEY);

    const res = await sdk.post_chat_completions({
      model: "llama-3.1-sonar-small-128k-online",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: data,
        },
      ],
    });

    if (res.data && res.data.choices && res.data.choices[0].message) {
      const aiResponse = res.data.choices[0].message.content;
      console.log("AI response:", aiResponse);
      return NextResponse.json({ message: aiResponse }, { status: 200 });
    } else {
      console.error("Unexpected API response format:", res);
      return NextResponse.json(
        { error: "Unexpected API response format" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
