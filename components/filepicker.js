"use client";

// import components
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

// import styling
import { Archivo } from "@/assets/fonts/fonts";
import styles from "./filepicker.module.css";

export default function FilePicker({
  name,
  onFileUpload,
  filePickerText,
  fileBlob,
  fetchedTitle,
  isGenerating,
  pickedFile,
  setPickedFile,
  modalIsOpen,
}) {
  const [progress, setProgress] = useState(0);
  const fileInput = useRef(null);
  const [uploadTask, setUploadTask] = useState(null);

  useEffect(() => {
    if (!modalIsOpen && uploadTask) {
      uploadTask.cancel();
      setProgress(0);
      console.log("Upload cancelled");
      setPickedFile(null);
    }
  }, [modalIsOpen]);

  function handlePickClick() {
    fileInput.current.click();
  }

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      setPickedFile(null);
      return;
    }

    uploadFile(file);
  }

  function uploadFile(file) {
    setPickedFile(file);
    const storage = getStorage();
    const storageRef = ref(storage, `essays/${file.name}`);
    const newUploadTask = uploadBytesResumable(storageRef, file);
    setUploadTask(newUploadTask);

    newUploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed: ", error);
      },
      () => {
        console.log("Upload complete");
        getDownloadURL(newUploadTask.snapshot.ref).then((downloadURL) => {
          onFileUpload(downloadURL);
          console.log("File available at", downloadURL);
        });
      }
    );
  }

  useEffect(() => {
    if (fileBlob) {
      const file = new File(
        [fileBlob],
        `${fetchedTitle} ${uuidv4()}${".pdf"}`,
        {
          type: fileBlob.type,
        }
      );
      uploadFile(file);
    }
  }, [fileBlob]);

  return (
    <div>
      <div>
        <input
          type="file"
          id={name}
          accept="file/pdf, file/epub"
          name={name}
          ref={fileInput}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        <div
          className={`${styles.button} ${
            progress > 99 ? styles.green : styles.normal
          } ${isGenerating ? styles.generatingButton : ""} `}
          type="button"
          onClick={handlePickClick}>
          {progress > 0 ? (
            progress > 99 ? (
              <div className={`${Archivo.className} ${styles.buttonText}`}>
                {pickedFile ? pickedFile.name : <p>Upload error</p>}
              </div>
            ) : (
              <div className={`${Archivo.className} ${styles.buttonText}`}>
                Uploading {Math.round(progress)}%
              </div>
            )
          ) : (
            <p
              className={`${Archivo.className} ${styles.buttonText} ${
                isGenerating ? styles.generatingText : ""
              } `}>
              {filePickerText ? filePickerText : "Upload a PDF or an EPUB"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
