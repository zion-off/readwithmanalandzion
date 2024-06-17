// import components
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import { Checkbox } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import FilePicker from "@/components/filepicker";

// import styling
import styles from "./essayDetail.module.css";
import { ClashDisplay, Archivo } from "@/assets/fonts/fonts";

export default function EssayDetail({
  isOpen,
  onOpenChange,
  id,
  title,
  author,
  notes,
  link,
  checked,
  fileURL,
  slug,
  onSaved,
  onDeleted,
  imageSource,
}) {
  const [editing, isEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [newAuthor, setNewAuthor] = useState(author);
  const [newNotes, setNewNotes] = useState(notes);
  const [newLink, setNewLink] = useState(fileURL);
  const [newChecked, setNewChecked] = useState(checked);
  const [newfileURL, setFileURL] = useState("");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [size, setSize] = React.useState("md");

  useEffect(() => {
    if (window.innerWidth < 600) {
      setSize('full');
    }
  }, []);

  useEffect(() => {
    setNewTitle(title);
    setNewAuthor(author);
    setNewNotes(notes);
    setNewLink(link);
    setNewChecked(checked);
    setFileURL(fileURL);
  }, [title, author, notes, link, checked, fileURL]);

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
      checked == newChecked &&
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
        checked: newChecked,
        fileURL: newfileURL,
      });
      onSaved({
        id,
        title: newTitle,
        author: newAuthor,
        notes: newNotes,
        link: newLink,
        checked: newChecked,
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
    } catch (error) {
      console.error("Error deleting essay: ", error);
    }
  };

  return (
    <>
      <Modal
      size={size}
        className="pb-5"
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();
          if (deleteDialog) {
            setDeleteDialog(false);
          }
        }}
        closeButton={
          <Image
          src={imageSource ? "../close.svg" : "./close.svg"}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "10%", minWidth: "50px", height: "auto", rotate: "45deg" }}
            alt="Add"
          />
        }
        hideCloseButton={editing ? true : false}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editing ? (
                  <>
                    <div className={styles.editingOptions}>
                      <p
                        onClick={toggleEditing}
                        className={`${Archivo.className} ${styles.cancel}`}>
                        Cancel
                      </p>
                      <div onClick={handleSave} className={styles.saveButton}>
                        <p className={`${Archivo.className} ${styles.save}`}>
                          Save
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.icons}>
                      <div>
                        {!slug && (
                          <>
                            <div
                              className={styles.edit}
                              onClick={toggleEditing}>
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
                            <div
                              className={styles.delete}
                              onClick={toggleDelete}>
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
                      </div>
                    </div>{" "}
                  </>
                )}
              </ModalHeader>
              <ModalBody>
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
                    <Checkbox
                      color="default"
                      isSelected={newChecked}
                      onValueChange={setNewChecked}>
                      Visible to others
                    </Checkbox>
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
                      <p
                        className={`${ClashDisplay.className} ${styles.title}`}>
                        {newTitle}
                      </p>
                      <p className={`${Archivo.className} ${styles.author}`}>
                        {newAuthor}
                      </p>
                    </div>
                    <p className={`${Archivo.className} ${styles.notes}`}>
                      {newNotes}
                    </p>
                    <div className={`${Archivo.className} ${styles.link}`}>
                      {newLink && <a href={newLink}>{newLink}</a>}
                    </div>
                    {!slug && (
                      <p
                        className={`${Archivo.className} ${styles.visibility}`}>
                        {checked ? "Publicly visible" : "Private"}
                      </p>
                    )}

                    {fileURL && (
                      <a href={fileURL}>
                        <p className={`${Archivo.className} ${styles.fileURL}`}>
                          Download
                        </p>
                      </a>
                    )}
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <div className={styles.deleteContainer}>
                  {deleteDialog && (
                    <div
                      className={`${Archivo.className} ${styles.deleteDialog}`}>
                     
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
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
