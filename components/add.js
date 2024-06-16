"use client";

// import components
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import FilePicker from "@/components/filepicker";
import Checkbox from "@/components/checkbox";
import Images from "@/components/randomCover";

// import styling
import styles from "./add.module.css";
import { ClashDisplay, Archivo } from "@/assets/fonts/fonts";

export default function Add({ onClose, onRefresh }) {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [randomImage, setRandomImage] = useState("");
  const [checked, setChecked] = useState(true);

  const handleChange = () => {
    setChecked(!checked);
  };

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * Images.length);
    setRandomImage(Images[randomIndex]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== "authenticated") {
      alert("You must be logged in to submit an essay");
      return;
    }

    const user = session.user;

    try {
      await addDoc(collection(db, "essays"), {
        cover: randomImage,
        title,
        author,
        notes,
        link,
        checked,
        fileURL,
        userId: user.email,
        userEmail: user.email,
        createdAt: new Date(),
      });
      onClose();
      onRefresh();
    } catch (error) {
      console.error("Error adding essay: ", error);
      alert("Failed to add essay");
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.headingContainer}>
        <h1 className={`${ClashDisplay.className} ${styles.heading}`}>
          Add Essay
        </h1>
        <div className={styles.close} onClick={onClose}>
          <Image
            src={"./close.svg"}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            alt="Add"
          />
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          required
          onChange={(e) => setTitle(e.target.value)}
          className={`${Archivo.className} ${styles.input}`}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          required
          onChange={(e) => setAuthor(e.target.value)}
          className={`${Archivo.className} ${styles.input}`}
        />
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          onChange={(e) => setNotes(e.target.value)}
          className={`${Archivo.className} ${styles.input}`}
        />
        <input
          type="text"
          name="links"
          placeholder="Link"
          onChange={(e) => setLink(e.target.value)}
          className={`${Archivo.className} ${styles.input}`}
        />
        <Checkbox label="Visible to others" value={checked} onChange={handleChange} />
        <FilePicker
          label="File"
          name="file"
          filePickerText="Upload a PDF or an EPUB"
          onFileUpload={setFileURL}
        />
        <div className={styles.buttonContainer}>
          <button
            type="submit"
            className={`${Archivo.className} ${styles.button}`}>
            Add to shelf
          </button>
        </div>
      </form>
    </div>
  );
}
