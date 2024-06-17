const FetchMetadata = async (url) => {
  try {
    const proxyUrl = `https://cors-anywhere-mu-lyart.vercel.app/${url}`;
    const res = await fetch(proxyUrl);
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const ogTitleElement = doc.querySelector('head > meta[property="og:title"]');
    const title = ogTitleElement ? ogTitleElement.content : '';

    const authorElements = doc.querySelectorAll('head > meta[name="author"]');
    const author = authorElements.length > 0 ? authorElements[0].content : '';

    return { title, author };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { title: '', author: '' };
  }
};

export default FetchMetadata;