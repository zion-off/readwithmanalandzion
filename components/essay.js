"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Images from "@/components/randomCover";
import styles from "./essay.module.css";

export default function Essay({ title, author, cover, favicon, onClick }) {
  const [randomImage, setRandomImage] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * Images.length);
    setRandomImage(Images[randomIndex]);
  }, []);

  useEffect(() => {
    if (cover || randomImage) {
      const img = document.createElement("img");
      img.src = (cover || randomImage).replace(/^url\((.+)\)$/, "$1");
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true); // Set to true even on error to show something
    }
  }, [cover, randomImage]);

  const backgroundImageStyle = `
    linear-gradient(
      to right,
      rgb(60, 13, 20) 3px,
      rgba(255, 255, 255, 0.5) 5px,
      rgba(255, 255, 255, 0.25) 7px,
      rgba(255, 255, 255, 0.25) 10px,
      transparent 12px,
      transparent 16px,
      rgba(255, 255, 255, 0.25) 17px,
      transparent 22px
    ),
    ${cover || randomImage}
  `;

  return (
    <div className={styles.main}>
      <div
        className={styles.book}
        onClick={onClick}
        style={{
          backgroundImage: imageLoaded ? backgroundImageStyle : "none",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          
        }}
      >
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-gray-200">
            <div className="h-full w-full bg-gray-400 rounded"></div>
          </div>
        )}
        {favicon !== "" && favicon !== null && favicon !== undefined && (
          <div className="absolute right-2 bottom-0 w-5 h-5">
            <Image
              src={favicon}
              width={30}
              height={30}
              alt="favicon"
              style={{
                boxShadow: `inset 0 0 10px rgba(0, 0, 0, 1)`,
              }}
            />
          </div>
        )}
      </div>
      <div className={styles.textContainer}>
        <h3 className={`sfProDisplay ${styles.title}`}>{title}</h3>
        <p className={`archivo ${styles.author}`}>{author}</p>
      </div>
    </div>
  );
}
