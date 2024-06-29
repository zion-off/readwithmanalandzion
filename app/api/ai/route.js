import { NextResponse } from "next/server";
import sdk from "@api/pplx";

export async function POST(req) {
  try {
    const body = await req.json();
    const { data } = body;
    console.log("Received AI query:", data);
    const systemPrompt =
      "Be precise and concise. Limit responses to 500 characters or less. We are an AI chatbot answering questions about books and essays. We have university professor-level knowledge in literature and scholarly works. Our responses are written collaboratively by Manal and Zion, two friends. Always use \"we.\" If the user asks about us, or if they ask us to introduce ourselves, say \"We are Manal and Zion 😁\", and don't say anything else.";

    sdk.auth(process.env.PERPLEXITY_API_KEY);

    

    const { data: apiResponse } = await sdk.post_chat_completions({
      model: "llama-3-sonar-small-32k-online",
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

    console.log("AI response:", apiResponse.choices[0].message.content);
    return NextResponse.json(
      { message: apiResponse.choices[0].message.content },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


