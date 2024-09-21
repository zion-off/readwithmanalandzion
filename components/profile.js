"use client";

// import components
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { SignInButton } from "../components/buttons";
import { signOut } from "next-auth/react";
import {
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Snippet,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from "uuid";

function Instructions({ isOpen, onOpenChange, userEmail }) {
  const [buttonText, setButtonText] = useState("Copy secret key");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [snippet, setSnippet] = useState("");
  useEffect(() => {
    if (buttonLoading) {
      setButtonText("Loading...");
    } else {
      setButtonText("Copy secret key");
      setSnippet("");
    }
  }, [onOpenChange]);
  async function checkAndAddDocument(userEmailString) {
    const shortcutRef = collection(db, "shortcut");
    const q = query(shortcutRef, where("user", "==", userEmailString));

    try {
      console.log("Checking for document");
      setButtonLoading(true);
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        // Document does not exist, create a new one
        const newDoc = {
          user: userEmailString,
          key: uuidv4(), // Generate a unique ID
        };
        await addDoc(shortcutRef, newDoc);
        setSnippet(newDoc.key);
        setButtonText("Key generated!");
      } else {
        querySnapshot.forEach((doc) => {
          const existingDoc = doc.data();
          setSnippet(existingDoc.key);
          setButtonText("Key generated!");
        });
        setButtonLoading(false);
      }
    } catch (error) {
      setButtonLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Add readwithmanaland iOS shortcut
            </ModalHeader>
            <ModalBody>
              <p>
                Step 1: Copy your secret key. This lets your phone access your
                account without a password.
              </p>
              <Button
                color="primary"
                onPress={() => checkAndAddDocument(userEmail)}
              >
                {buttonText}
              </Button>
              {snippet.length > 0 && <Snippet hideSymbol>{snippet}</Snippet>}
              <p>
                Step 2:{" "}<Link href="./Add to shelf.shortcut">Download</Link> the shortcut file and open it in the Shortcuts app.
              </p>
              <p>
                Step 3: Paste your key in the text box and run the shortcut.
              </p>
              <p>
                Done! Now you can add articles to your shelf directly from
                Safari.
              </p>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

export default function Profile() {
  const { data: session } = useSession();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const copyProfileLink = () => {
    const user = session.user;
    const email = user.email;
    navigator.clipboard.writeText(
      `https://readwithmanaland.zzzzion.com/user/${email}`
    );
  };

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly className="bg-transparent">
            <SignInButton style={{ borderRadius: "50%" }} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
          <DropdownItem key="ios" onPress={onOpen}>
            iOS shortcut instructions
          </DropdownItem>
          <DropdownItem key="copy" onClick={() => copyProfileLink()}>
            Copy shelf link
          </DropdownItem>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            onClick={() => signOut()}
          >
            Sign out
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Instructions
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        userEmail={session.user.email}
      />
    </>
  );
}
