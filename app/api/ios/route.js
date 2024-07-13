import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

// Ensure Firebase Storage is initialized
const storage = getStorage();

const getDocumentReferenceByKey = async (keyValue) => {
  try {
    const q = query(collection(db, "shortcut"), where("key", "==", keyValue));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No matching documents found.");
      return null;
    }

    const doc = querySnapshot.docs[0];
    const docData = doc.data();
    const userFieldValue = docData.user;

    console.log("Document ID:", doc.id);
    console.log("User field value:", userFieldValue);
    return userFieldValue;
  } catch (error) {
    console.error("Error querying documents: ", error);
    return null;
  }
};

const getRandomCover = async () => {
  const storageRef = ref(storage, "covers");
  try {
    const res = await listAll(storageRef);
    const items = res.items;
    if (items.length === 0) {
      throw new Error('No images found in the "covers" folder.');
    }
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const url = await getDownloadURL(randomItem);
    return url;
  } catch (error) {
    console.error("Error fetching images from Firebase Storage:", error);
    return null; // Handle the case where no URL is fetched
  }
};

const fetchMetadata = async (link) => {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? "https://" + process.env.VERCEL_URL
      : "http://localhost:3000";
    const response = await fetch(
      `${baseUrl}/api/metadata?url=${encodeURIComponent(link)}`
    );
    const data = await response.json();
    const essayData = {
      title: data.ogTitle || "Not found",
      author: data.ogAuthor || "Not found",
      favicon: data.favicon || "",
      cover: `url(${await getRandomCover()})`,
    };
    return essayData;
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return {
      title: "Not found",
      author: "Not found",
      favicon: "",
      cover: `url(${await getRandomCover()})`,
    };
  }
};

export async function GET(request) {
  console.log("GET request received");
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const key = searchParams.get("key");

  console.log("url", url);
  console.log("key", key);

  if (!url || !key) {
    return new NextResponse(
      JSON.stringify({ error: "URL and key parameters are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const userEmail = await getDocumentReferenceByKey(key);

  if (!userEmail) {
    return new NextResponse(
      JSON.stringify({ error: "No user email found for the given key" }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const metadata = await fetchMetadata(url);

  try {
    console.log(`Adding essay: ${metadata.title} by ${metadata.author}`);
    await addDoc(collection(db, "essays"), {
      cover: metadata.cover,
      title: metadata.title,
      author: metadata.author,
      notes: "",
      link: url,
      favicon: metadata.favicon,
      checked: true,
      fileURL: "",
      userId: userEmail,
      userEmail: userEmail,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Error adding essay: ", error);
    return new NextResponse(JSON.stringify({ error: "Error adding essay" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new NextResponse(
    JSON.stringify({
      title: metadata.title,
      author: metadata.author,
      userEmail: userEmail,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
