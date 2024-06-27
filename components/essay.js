"use client";

// import components
import { useEffect, useState } from "react";
import Image from "next/image";
import Images from "@/components/randomCover";

// import styling
import { Archivo, SFProDisplayRegular } from "@/assets/fonts/fonts";
import styles from "./essay.module.css";

export default function Essay({ title, author, cover, favicon, onClick }) {
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
        }}
      >
        {favicon !== undefined && (
          <div className="absolute right-2 bottom-0 md:bg-black w-5 h-5">
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
        <h3 className={`${SFProDisplayRegular.className} ${styles.title}`}>
          {title}
        </h3>
        <p className={`${Archivo.className} ${styles.author}`}>{author}</p>
      </div>
    </div>
  );
}
