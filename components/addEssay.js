import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Checkbox } from "@nextui-org/react";
import { db, storage } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import FilePicker from "@/components/filepicker";

// import styling
import styles from "./addEssay.module.css";
import { ClashDisplay, Archivo } from "@/assets/fonts/fonts";

export default function AddEssay({ onRefresh }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { data: session, status } = useSession();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [checked, setChecked] = useState(true);

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("got here");
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
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding essay: ", error);
      alert("Failed to add essay");
    }
  };

  return (
    <>
      <div style={{ borderRadius: "50%" }}>
        <Button
          onPress={onOpen}
          class="absolute bottom-8 right-8 w-[10vw] h-[10vw] rounded-full bg-black focus:outline-none active:scale-95 transition duration-200">
          <Image
            src={"./add.svg"}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto", padding: "10%" }}
            alt="Add"
          />
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        closeButton={
          <Image
            src={"./close.svg"}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "10%", height: "auto", rotate: "45deg" }}
            alt="Add"
          />
        }>
        <ModalContent className="px-2 py-5">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className={styles.headingContainer}>
                  <h1 className={`${ClashDisplay.className} ${styles.heading}`}>
                    Add Essay
                  </h1>
                </div>
              </ModalHeader>
              <ModalBody>
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
                  <Checkbox
                    defaultSelected
                    color="default"
                    isSelected={checked}
                    onValueChange={setChecked}>
                    Visible to others
                  </Checkbox>
                  <FilePicker
                    label="File"
                    name="file"
                    filePickerText="Upload a PDF or an EPUB"
                    onFileUpload={setFileURL}
                  />
                  <ModalFooter className="w-full px-0 py-0">
                    <div className={styles.buttonContainer}>
                      <button
                        type="submit"
                        className={`${Archivo.className} ${styles.button}`}>
                        Add to shelf
                      </button>
                    </div>
                  </ModalFooter>
                </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}