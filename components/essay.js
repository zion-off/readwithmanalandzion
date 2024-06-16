"use client";

// import components
import { useEffect, useState } from "react";
import Images from "@/components/randomCover";

// import styling
import { Archivo } from "@/assets/fonts/fonts";
import styles from "./essay.module.css";

export default function Essay({ title, author, cover, onClick }) {
  const [randomImage, setRandomImage] = useState("");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * Images.length);
    setRandomImage(Images[randomIndex]);
  }, []);

  return (
    <div className={styles.main}>
      <div
        onClick={onClick}
        className={styles.book}
        style={{
          backgroundImage: `linear-gradient(
            to right,
            rgb(60, 13, 20) 3px,
            rgba(255, 255, 255, 0.5) 5px,
            rgba(255, 255, 255, 0.25) 7px,
            rgba(255, 255, 255, 0.25) 10px,
            transparent 12px,
            transparent 16px,
            rgba(255, 255, 255, 0.25) 17px,
            transparent 22px
          ), ${cover || randomImage}`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}></div>
      <div className={styles.textContainer}>
        <h3 className={`${Archivo.className} ${styles.title}`}>{title}</h3>
        <p className={`${Archivo.className} ${styles.author}`}>{author}</p>
      </div>
    </div>
  );
}
