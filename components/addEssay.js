// import dependencies
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
} from "@nextui-org/react";
// firebase imports
import { useSession } from "next-auth/react";
import { db, storage } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, listAll, getDownloadURL } from "firebase/storage";
// import components
import FilePicker from "@/components/filepicker";
import Loader from "@/components/loader";
// import styling
import styles from "./addEssay.module.css";

export default function AddEssay({ onRefresh }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure(); // for modal
  const { data: session, status } = useSession(); // for authentication
  // state variables
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [notes, setNotes] = useState("");
  const [link, setLink] = useState("");
  const [favicon, setFavicon] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fileBlob, setFileBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // loading indication for generating PDF
  const [pickedFile, setPickedFile] = useState(null);
  const [size, setSize] = useState("md");
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const [generatePDFClicked, setGeneratePDFClicked] = useState(false);

  useEffect(() => {
    console.log("File URL set to", fileURL);
  }, [fileURL]);

  // set modal size to full screen on mobile
  useEffect(() => {
    if (window.innerWidth < 600) {
      setSize("full");
    }
  }, []);

  // helper function to check if entered URL is valid
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (err) {
      return false;
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setAuthor("");
      setNotes("");
      setLink("");
      setFavicon("");
      setFileURL("");
      setFileBlob(null);
      setChecked(true);
      setPickedFile(null);
      setIsUploadComplete(false);
      setGeneratePDFClicked(false);
    }
  }, [isOpen]);

  // fetch metadata when link is entered
  const fetchMetadata = async () => {
    const response = await fetch(
      `/api/metadata?url=${encodeURIComponent(link)}`
    );
    const data = await response.json();
    if (data.ogTitle === "" || data.ogAuthor === "" || data.favicon === "") return;
    if (data.ogTitle === "Not found") {
      setTitle("");
    } else {
      setTitle(data.ogTitle);
    }
    if (data.ogAuthor === "Not found") {
      setAuthor("");
    } else {
      setAuthor(data.ogAuthor);
    }
    if (data.favicon === "Not found") {
      setFavicon("");
    } else {
      if (data.favicon === "jstor") {
        setFavicon("/jstor.png");
      }
      else {
        setFavicon(data.favicon);
      }
     
    }
  };

  useEffect(() => {
    if (link !== "" && isValidUrl(link)) {
      fetchMetadata();
    }
  }, [link]);

  // generate PDF from URL
  const generatePDF = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching PDF...");
      const encodedUrl = encodeURIComponent(link);
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
      setFileBlob(blob);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  function generatePDFLinkClicked() {
    setGeneratePDFClicked(true);
    if (link !== "" && isValidUrl(link)) {
      console.log("Valid link detected, generating PDF");
      generatePDF();
    }
  }

  // fetch a random cover image from Firebase Storage
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

  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (status !== "authenticated") {
      alert("You must be logged in to submit an essay");
      return;
    }

    const user = session.user;

    try {
      console.log(
        `Adding essay: ${title} by ${author}, available at ${fileURL}`
      );
      await addDoc(collection(db, "essays"), {
        cover: `url(${await getRandomCover()})`,
        title,
        author,
        notes,
        link,
        favicon,
        checked,
        fileURL: fileURL,
        userId: user.email,
        userEmail: user.email,
        createdAt: new Date(),
      });
      onRefresh();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding essay: ", error);
      alert("Failed to add essay");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
      size="md"
        isIconOnly
        onPress={onOpen}
        className=" rounded-full bg-zinc-900 focus:outline-none active:scale-95 transition duration-200 sm:hover:rotate-90 hover:duration-500 hover:ease">
        <Image
          src={"./add.svg"}
          width={0}
          height={0}
          style={{
            width: "90%",
            height: "90%",
            padding: "10%",
          }}
          alt="Add"
          
        />
      </Button>
      <Modal
        className="backdrop-blur-lg bg-white/90"
        backdrop="transparent"
        size={size}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={() => {
          setFileBlob(null);
          setIsLoading(false);
          setLoading(false);
          setFileURL("");
          setPickedFile(null);
        }}
        scrollBehavior="inside"
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
        <ModalContent className="px-2 py-5 rounded-2xl">
          {(onClose) => (
            <>
              <ModalHeader>
                <div>
                  <h1
                    className={`sfProDisplay ${styles.heading}`}>
                    Add essay
                  </h1>
                </div>
              </ModalHeader>
              <ModalBody className="overflow-y-auto">
                <form className={styles.form} onSubmit={handleSubmit}>
                  <Input
                    type="text"
                    name="title"
                    value={title}
                    placeholder="Title"
                    required
                    onChange={(e) => setTitle(e.target.value)}
                    classNames={{
                      label: `bg-transparent shadow-none  `,
                      input:
                        `bg-transparent shadow-none group-data-[focus=true]:bg-transparent sfProDisplay ${styles.input}`,
                      innerWrapper: "bg-transparent shadow-none",
                      inputWrapper:
                        "bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                    }}
                    endContent={ favicon !== "" ? <Image src={favicon} width={20} height={20} alt="favicon" /> : null}
                  />
                  <Input
                    type="text"
                    name="author"
                    value={author}
                    placeholder="Author"
                    // required
                    onChange={(e) => setAuthor(e.target.value)}
                    classNames={{
                      label: `bg-transparent shadow-none`,
                      input:
                        `bg-transparent shadow-none group-data-[focus=true]:bg-transparent  sfProDisplay ${styles.input}`,
                      innerWrapper: "bg-transparent shadow-none",
                      inputWrapper:
                        "bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                    }}
                  />
                  <Input
                    type="text"
                    name="notes"
                    placeholder="Notes"
                    onChange={(e) => setNotes(e.target.value)}
                    classNames={{
                      label: `bg-transparent shadow-none`,
                      input:
                        `bg-transparent shadow-none group-data-[focus=true]:bg-transparent sfProDisplay ${styles.input}`,
                      innerWrapper: "bg-transparent shadow-none",
                      inputWrapper:
                        "bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                    }}
                  />
                  <Input
                    type="text"
                    name="links"
                    placeholder="Link"
                    onChange={(e) => setLink(e.target.value)}
                    classNames={{
                      label: `bg-transparent shadow-none`,
                      input:
                        `bg-transparent shadow-none group-data-[focus=true]:bg-transparent  sfProDisplay ${styles.input}`,
                      innerWrapper: "bg-transparent shadow-none",
                      inputWrapper:
                        "bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                    }}
                    endContent={
                      link ? (generatePDFClicked ? null : <Button onPress={generatePDFLinkClicked} size="sm" color="primary" className="px-5" variant="ghost">
                        Save PDF
                      </Button>  ) : null
                    }
                  />
                  <Checkbox
                    defaultSelected
                    color="default"
                    isSelected={checked}
                    onValueChange={setChecked}>
                    Visible to others
                  </Checkbox>
                  <FilePicker
                    pickedFileChanger={setPickedFile}
                    label="File"
                    name="file"
                    filePickerText={
                      isLoading
                        ? "Generating PDF..."
                        : "Upload a PDF or an EPUB"
                    }
                    onFileUpload={setFileURL}
                    fileBlob={fileBlob}
                    isGenerating={isLoading}
                    fetchedTitle={title}
                    pickedFile={pickedFile}
                    modalIsOpen={isOpen}
                    onUploadComplete={setIsUploadComplete}
                    generatePDFClicked={generatePDFClicked}
                  />
                  <ModalFooter className="w-full px-0 py-0">
                    <div className={styles.buttonContainer}>
                      <button
                        type="submit"
                        className={`archivo ${styles.button}`}
                        disabled={loading}>
                        {loading ? (
                          <Loader
                            circleStyle={{
                              maxHeight: "10px",
                              maxWidth: "10px",
                            }}
                            containerStyle={{ padding: 0.5, gap: 1.5 }}
                          />
                        ) : (
                          "Add to shelf"
                        )}
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
