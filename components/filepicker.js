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
  pickedFileChanger,
  modalIsOpen,
  onUploadComplete,
}) {
  const [progress, setProgress] = useState(0);
  const fileInput = useRef(null);
  const [uploadTask, setUploadTask] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  
  useEffect(() => {
    if (!modalIsOpen) {
      if (uploadTask) {
        uploadTask.cancel();
        setUploadTask(null);
      }
      setProgress(0);
      console.log("Upload cancelled");
      onFileUpload("");
    }
  }, [modalIsOpen]);

  function handlePickClick() {
    fileInput.current.click();
  }

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) {
      pickedFileChanger(null);
      return;
    }

    uploadFile(file);
  }

  function uploadFile(file) {
    setUploadComplete(false);
    pickedFileChanger(file);
    const storage = getStorage();
    const storageRef = ref(storage, `essays/${file.name}`);
    const newUploadTask = uploadBytesResumable(storageRef, file);
    setUploadTask(newUploadTask);

    newUploadTask.on(
      "state_changed",
      (snapshot) => {
        if (!modalIsOpen) {
          newUploadTask.cancel();
          setProgress(0);
          setUploadTask(null);
          console.log("Upload cancelled due to modal closure");
          return;
        }
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        console.error("Upload failed: ", error);
        onFileUpload(null, error);
        setUploadComplete(false);
      },
      () => {
        console.log("Upload complete");
        getDownloadURL(newUploadTask.snapshot.ref).then((downloadURL) => {
          onFileUpload(downloadURL);
          setUploadComplete(true);
          console.log("File available at", downloadURL);
        });
      }
    );
  }

  useEffect(() => {
    if (fileBlob && modalIsOpen) {
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
            progress == 100 ? styles.green : styles.normal
          } ${isGenerating ? styles.generatingButton : ""} `}
          type="button"
          onClick={handlePickClick}>
          {progress > 0 ? (
            uploadComplete ? (
              <div className={`${Archivo.className} ${styles.buttonText}`}>
                {pickedFile ? pickedFile.name : <p>Upload complete</p>}
              </div>
            ) : (
              <div className={`${Archivo.className} ${styles.buttonText}`}>
                {progress === 100 ? "Processing..." : `Uploading ${Math.round(progress)}%`}
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
