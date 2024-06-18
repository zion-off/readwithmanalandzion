import cheerio from "cheerio";

export async function GET(request) {
  console.log("GET request received");
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(
      JSON.stringify({ error: "URL parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    let ogTitle = $('meta[property="og:title"]').attr('content');
    let ogAuthor = $('meta[name="author"]').attr('content');

    // If og:title is not found, fallback to <title> tag content
    if (!ogTitle) {
      ogTitle = $('title').text().trim();
    }

    // If neither og:title nor <title> tag content is found, set to 'Not found'
    if (!ogTitle) {
      ogTitle = 'Not found';
    }

    // If og:author is not found, set to 'Not found'
    if (!ogAuthor) {
      ogAuthor = 'Not found';
    }

    return new Response(JSON.stringify({ ogTitle, ogAuthor }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to fetch the URL", error);
    return new Response(JSON.stringify({ error: "Failed to fetch the URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
