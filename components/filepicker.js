"use client";

// import components
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useRef, useState, useEffect } from "react";

// import styling
import { Archivo } from "@/assets/fonts/fonts";
import styles from "./filepicker.module.css";

export default function FilePicker({ name, onFileUpload, filePickerText, fileBlob }) {
  const [pickedFile, setPickedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef(null);

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
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
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
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          onFileUpload(downloadURL);
        });
      }
    );
  }

  useEffect(() => {
    if (fileBlob) {
      const file = new File([fileBlob], "PDF Uploaded!", { type: fileBlob.type });
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

        <div className={`${styles.button} ${progress > 99 ? styles.green : styles.normal} `} type="button" onClick={handlePickClick}>
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
            <p className={`${Archivo.className} ${styles.buttonText}`}>
              {filePickerText ? filePickerText : "Upload a file"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
