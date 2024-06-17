const FetchMetadata = async (url) => {
  try {
    const proxyUrl = `https://readwithmanaland.zzzzion.com/api/fetch-metadata?url=${encodeURIComponent(
      url
    )}`;
    const res = await fetch(proxyUrl);
    const { html } = await res.json();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const titleElement = doc.querySelector("head > title");
    const title = titleElement ? titleElement.textContent : "";

    const authorElements = doc.querySelectorAll('head > meta[name="author"]');
    const author = authorElements.length > 0 ? authorElements[0].content : "";

    return { title, author };
  } catch (error) {
    return { title: "", author: "" };
  }
};

export default FetchMetadata;
