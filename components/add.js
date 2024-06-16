// import components
import { useState } from "react";
import Image from "next/image";
import { db, storage } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { useSession } from "next-auth/react";
import FilePicker from "@/components/filepicker";
import Checkbox from "@/components/checkbox";

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
  const [checked, setChecked] = useState(true);

  const handleChange = async () => {
    setChecked(!checked);
  };

  const getRandomCover = async () => {
    const storageRef = ref(storage, 'covers');
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
      console.error('Error fetching images from Firebase Storage:', error);
    }

  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (status !== "authenticated") {
      alert("You must be logged in to submit an essay");
      return;
    }

    const user = session.user;

    try {
      await addDoc(collection(db, "essays"), {
        cover: `url(${await getRandomCover()})`,
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
