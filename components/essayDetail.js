// import components
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Link,
} from "@nextui-org/react";
import { Checkbox } from "@nextui-org/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/firebase";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import FilePicker from "@/components/filepicker";
import { getStorage, ref, deleteObject } from "firebase/storage";

// import styling
import styles from "./essayDetail.module.css";

export default function EssayDetail({
  isOpen,
  onOpenChange,
  id,
  title,
  author,
  notes,
  link,
  favicon,
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
  const [newfileURL, setNewFileURL] = useState(fileURL);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [size, setSize] = React.useState("md");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 600) {
      setSize("full");
    }
    console.log(favicon);
  }, []);

  useEffect(() => {
    setNewTitle(title);
    setNewAuthor(author);
    setNewNotes(notes);
    setNewLink(link);
    setNewChecked(checked);
    setNewFileURL(fileURL);
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
        fileURL: newfileURL !== "" ? newfileURL : fileURL,
      });
      onSaved({
        id,
        title: newTitle,
        author: newAuthor,
        notes: newNotes,
        link: newLink,
        checked: newChecked,
        fileURL: newfileURL !== "" ? newfileURL : fileURL,
      });
      toggleEditing();
      console.log("Document successfully updated!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const storage = getStorage();
      await deleteDoc(doc(db, "essays", id));
      if (fileURL !== "") {
        await deleteObject(ref(storage, fileURL));
      }
      setDeleteDialog(false);
      toggleEditing();
      onDeleted();
      isEditing(false);
    } catch (error) {
      console.error("Error deleting essay: ", error);
    }
  };

  // generate PDF from URL
  const generatePDF = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching PDF...");
      const encodedUrl = encodeURIComponent(newLink);
      const response = await fetch(
        `https://generate-pdf-zc2q.onrender.com/generate-pdf?url=${encodedUrl}`,
        {
          method: "GET",
        }
      );
      console.log("Response received:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      console.log("Blob created:", blob);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        backdrop="transparent"
        size={size}
        className="backdrop-blur-lg bg-white/90 pb-5"
        isOpen={isOpen}
        onOpenChange={() => {
          onOpenChange();
          if (deleteDialog) {
            setDeleteDialog(false);
          }
          isEditing(false);
        }}
        closeButton={
          <Image
            src={imageSource ? "../close.svg" : "./close.svg"}
            width={0}
            height={0}
            sizes="100vw"
            style={{
              width: "10%",
              minWidth: "30px",
              height: "auto",
              rotate: "45deg",
              top: "10px",
              right: "8px",
            }}
            alt="Add"
          />
        }
        hideCloseButton={editing ? true : false}
      >
        <ModalContent className="rounded-2xl">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 px-6 pt-6">
                {editing ? (
                  <>
                    <div className={styles.editingOptions}>
                      <p
                        onClick={toggleEditing}
                        className={`archivo ${styles.cancel}`}
                      >
                        Cancel
                      </p>
                      <div onClick={handleSave} className={styles.saveButton}>
                        <p className={`archivo ${styles.save}`}>Save</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {!slug && (
                      <div className={styles.icons}>
                        <Button
                          isIconOnly
                          aria-label="Edit"
                          onClick={toggleEditing}
                          className="min-w-5 h-5 w-5 p-0"
                          variant="light"
                          radius="none"
                        >
                          <Image
                            src={"./edit.svg"}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ height: "100%", width: "auto" }}
                            alt="Edit"
                          />
                        </Button>
                        <Button
                          isIconOnly
                          aria-label="Edit"
                          onClick={toggleDelete}
                          className="min-w-5 h-5 w-5 p-0"
                          variant="light"
                          radius="none"
                        >
                          <Image
                            src={"./delete.svg"}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ height: "100%", width: "auto" }}
                            alt="Edit"
                          />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </ModalHeader>
              <ModalBody>
                {editing ? (
                  <>
                    <div className={styles.headingContainer}>
                      <Input
                        type="text"
                        name="title"
                        placeholder={title}
                        required
                        onChange={(e) => setNewTitle(e.target.value)}
                        classNames={{
                          label: `bg-transparent shadow-none sfProDisplay ${styles.input}`,
                          input:
                            "text-base bg-transparent shadow-none group-data-[focus=true]:bg-transparent",
                          innerWrapper: "bg-transparent shadow-none",
                          inputWrapper:
                            "px-0 bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                        }}
                      />
                      <Input
                        type="text"
                        name="author"
                        placeholder={author}
                        required
                        onChange={(e) => setNewAuthor(e.target.value)}
                        classNames={{
                          label: `bg-transparent shadow-none sfProDisplay ${styles.input}`,
                          input:
                            "text-base bg-transparent shadow-none group-data-[focus=true]:bg-transparent",
                          innerWrapper: "bg-transparent shadow-none",
                          inputWrapper:
                            "px-0 bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                        }}
                      />
                      <Input
                        type="text"
                        name="notes"
                        placeholder={notes || "Notes"}
                        onChange={(e) => setNewNotes(e.target.value)}
                        classNames={{
                          label: `bg-transparent shadow-none sfProDisplay ${styles.input}`,
                          input:
                            "text-base bg-transparent shadow-none group-data-[focus=true]:bg-transparent",
                          innerWrapper: "bg-transparent shadow-none",
                          inputWrapper:
                            "px-0 bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                        }}
                      />
                      <Input
                        type="url"
                        name="link"
                        placeholder={link || "Enter a link here"}
                        onChange={(e) => setNewLink(e.target.value)}
                        classNames={{
                          label: ` bg-transparent shadow-none sfProDisplay ${styles.input}`,
                          input:
                            "text-base bg-transparent shadow-none group-data-[focus=true]:bg-transparent",
                          innerWrapper: "bg-transparent shadow-none",
                          inputWrapper:
                            "px-0 bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                        }}
                      />
                      <Checkbox
                        color="default"
                        isSelected={newChecked}
                        onValueChange={setNewChecked}
                        className="sfProDisplay my-1"
                      >
                        <span className="font-normal">
                        Visible to others
                        </span>
                        
                      </Checkbox>
                    </div>
                    <FilePicker
                      label="File"
                      name="file"
                      filePickerText="Upload a different file"
                      onFileUpload={setNewFileURL}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.headingContainer}>
                      {favicon !== "" && favicon !== undefined && (
                        <Image
                          src={favicon}
                          width={30}
                          height={30}
                          alt="favicon"
                          className="mb-3"
                        />
                      )}
                      <p className={`sfProDisplay ${styles.title}`}>
                        {newTitle}
                      </p>
                      <p className={`archivo ${styles.author}`}>{newAuthor}</p>
                    </div>
                    <p className={`archivo ${styles.notes}`}>{newNotes}</p>
                    <div className={`archivo ${styles.link}`}>
                      {newLink && (
                        <Link isExternal href={newLink} showAnchorIcon>
                          Link
                        </Link>
                      )}
                    </div>

                    {!slug && (
                      <p className={`archivo ${styles.visibility}`}>
                        {checked ? "Publicly visible" : "Private"}
                      </p>
                    )}
                    {!fileURL &&
                      newLink &&
                      (isLoading ? (
                        <Button
                          size="sm"
                          color="primary"
                          className="w-1/5"
                          isLoading
                        ></Button>
                      ) : (
                        <Button
                          onPress={generatePDF}
                          size="sm"
                          color="primary"
                          className="w-1/5 sfProDisplay"
                        >
                          Open PDF
                        </Button>
                      ))}
                    {fileURL && (
                      <a href={fileURL}>
                        <p className={`sfProDisplay ${styles.fileURL}`}>
                          Download
                        </p>
                      </a>
                    )}
                  </>
                )}
              </ModalBody>
              {deleteDialog && (
                <ModalFooter>
                  <div className={`${styles.deleteContainer}`}>
                    <div className={`archivo ${styles.deleteDialog}`}>
                      <div className={styles.deleteButtons}>
                        <div className={styles.cancel} onClick={toggleDelete}>
                          Cancel
                        </div>
                        <Button
                          size="sm"
                          className={styles.deleteButton}
                          onClick={() => {
                            handleDelete(id);
                            onClose();
                          }}
                        >
                          <p className={`archivo ${styles.save}`}>Delete</p>
                        </Button>
                      </div>
                    </div>
                  </div>
                </ModalFooter>
              )}
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
