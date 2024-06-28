"use client";

// component imports
import * as React from "react";
import Profile from "@/components/profile";
import { NextUIProvider } from "@nextui-org/react";
import { useState, useRef, useEffect } from "react";
import AuthCheck from "@/components/AuthCheck";
import Shelf from "@/components/shelf";
import AddEssay from "@/components/addEssay";

// import styling
import styles from "./page.module.css";

export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <NextUIProvider>
      <main className={styles.main}>
        <AuthCheck>
          <div className={styles.signInContainer}>
            <Profile />
          </div>
          <Shelf refresh={refresh} />
          <AddEssay onRefresh={handleRefresh} />
        </AuthCheck>
      </main>
    </NextUIProvider>
  );
}
