"use client";

// import components
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import FilePicker from "@/components/filepicker";

// import styling
import styles from "./essayDetail.module.css";
import { ClashDisplay, Archivo } from "@/assets/fonts/fonts";

export default function EssayDetail({
  id,
  title,
  author,
  notes,
  link,
  fileURL,
  closeModal,
  onSaved,
  onDeleted,
  slug,
  imageSource
}) {
  const [editing, isEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newAuthor, setNewAuthor] = useState(author);
  const [newNotes, setNewNotes] = useState(notes);
  const [newLink, setNewLink] = useState(fileURL);
  const [newfileURL, setFileURL] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);

  useEffect(() => {
    setNewTitle(title);
    setNewAuthor(author);
    setNewNotes(notes);
    setNewLink(link);
    setFileURL(fileURL);
  }, [title, author, notes, link, fileURL]);

  const toggleEditing = () => {
    isEditing(!editing);
  };

  const toggleDelete = () => {
    setDeleteDialog(!deleteDialog);
  };

  const handleSave = async () => {
    console.log("saving");
    if (
      title == newTitle &&
      author == newAuthor &&
      notes == newNotes &&
      link == newLink &&
      fileURL == newfileURL
    ) {
      return;
    }

    try {
      const essayRef = doc(db, "essays", id);
      await updateDoc(essayRef, {
        title: newTitle,
        author: newAuthor,
        notes: newNotes,
        link: newLink,
        fileURL: newfileURL,
      });
      onSaved({
        id,
        title: newTitle,
        author: newAuthor,
        notes: newNotes,
        link: newLink,
        fileURL: newfileURL,
      });
      toggleEditing();
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "essays", id));
      setDeleteDialog(false);
      toggleEditing();
      onDeleted();
      closeModal();
    } catch (error) {
      console.error("Error deleting essay: ", error);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        {editing ? (
          <>
            <div className={styles.editingOptions}>
              <p
                onClick={toggleEditing}
                className={`${Archivo.className} ${styles.cancel}`}>
                Cancel
              </p>
              <div onClick={handleSave} className={styles.saveButton}>
                <p className={`${Archivo.className} ${styles.save}`}>Save</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.icons}>
              <div>
                {!slug && (
                  <>
                    <div className={styles.edit} onClick={toggleEditing}>
                      <Image
                        src={"./edit.svg"}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ height: "100%", width: "auto" }}
                        alt="Edit"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className={styles.rightSideIcons}>
                {!slug && (
                  <>
                    <div className={styles.delete} onClick={toggleDelete}>
                      <Image
                        src={"./delete.svg"}
                        width={0}
                        height={0}
                        sizes="100vw"
                        style={{ height: "100%", width: "auto" }}
                        alt="Edit"
                      />
                    </div>
                  </>
                )}

                <div className={styles.close} onClick={closeModal}>
                  <Image
                    src={imageSource ? "../close.svg" : "./close.svg"}
                    width={0}
                    height={0}
                    sizes="100vw"
                    style={{ height: "100%", width: "auto" }}
                    alt="Add"
                  />
                </div>
              </div>
            </div>{" "}
          </>
        )}

        {editing ? (
          <>
            <div className={styles.headingContainer}>
              <input
                type="text"
                name="title"
                placeholder={title}
                required
                onChange={(e) => setNewTitle(e.target.value)}
                className={`${ClashDisplay.className} ${styles.titleInput}`}
              />
              <input
                type="text"
                name="author"
                placeholder={author}
                required
                onChange={(e) => setNewAuthor(e.target.value)}
                className={`${Archivo.className} ${styles.input}`}
              />
            </div>
            <input
              type="text"
              name="notes"
              placeholder={notes || "Notes"}
              onChange={(e) => setNewNotes(e.target.value)}
              className={`${Archivo.className} ${styles.input}`}
            />
            <input
              type="url"
              name="link"
              placeholder={link || "Enter a link here"}
              onChange={(e) => setNewLink(e.target.value)}
              className={`${Archivo.className} ${styles.input}`}
            />
            <FilePicker
              label="File"
              name="file"
              filePickerText="Upload a different file"
              onFileUpload={setFileURL}
            />
          </>
        ) : (
          <>
            <div className={styles.headingContainer}>
              <p className={`${ClashDisplay.className} ${styles.title}`}>
                {newTitle}
              </p>
              <p className={`${Archivo.className} ${styles.author}`}>
                {newAuthor}
              </p>
            </div>
            <p className={`${Archivo.className} ${styles.notes}`}>{newNotes}</p>
            <div className={`${Archivo.className} ${styles.link}`}>
              {newLink && <a href={newLink}>{newLink}</a>}
            </div>
          </>
        )}
        {fileURL && (
          <a href={fileURL}>
            <p className={`${Archivo.className} ${styles.fileURL}`}>Download</p>
          </a>
        )}
      </div>
      <div className={styles.modalOverlay} onClick={closeModal}></div>
      {deleteDialog && (
        <div className={`${Archivo.className} ${styles.deleteDialog}`}>
          <p>Delete this essay?</p>
          <div className={styles.deleteButtons}>
            <div className={styles.cancel} onClick={toggleDelete}>
              Cancel
            </div>
            <div className={styles.deleteButton}>
              <p
                className={`${Archivo.className} ${styles.save}`}
                onClick={() => handleDelete(id)}>
                Delete
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
