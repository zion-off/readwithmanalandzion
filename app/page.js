"use client";

// component imports
import { useState, useRef, useEffect } from "react";
import AuthCheck from "@/components/AuthCheck";
import Shelf from "@/components/shelf";
import Add from "@/components/add";
import { SignInButton, AddButton, SignOutButton } from "../components/buttons";

// import styling
import styles from "./page.module.css";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const signInButtonRef = useRef(null);

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  const handleSignInClick = () => {
    setShowSignOut(!showSignOut);
  };

  const handleClickOutside = (event) => {
    if (
      signInButtonRef.current &&
      !signInButtonRef.current.contains(event.target)
    ) {
      setShowSignOut(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <main className={styles.main}>
      <AuthCheck>
        <div
          className={styles.signInContainer}
          ref={signInButtonRef}
          onClick={handleSignInClick}>
          <SignInButton style={{ borderRadius: "50%" }} />
          <div
            className={`${styles.signOutContainer} ${
              showSignOut ? styles.show : ""
            }`}>
            {showSignOut && <SignOutButton />}
          </div>
        </div>

        <Shelf refresh={refresh} />
        <AddButton toggleModal={toggleModal} />
        {showModal && (
          <div>
            <div onClick={toggleModal} className={styles.modalOverlay}></div>
            <Add onClose={toggleModal} onRefresh={handleRefresh} />
          </div>
        )}
      </AuthCheck>
    </main>
  );
}
