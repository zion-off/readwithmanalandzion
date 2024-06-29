// component imports
import * as React from "react";
import Profile from "@/components/profile";
import { NextUIProvider } from "@nextui-org/react";
import AuthCheck from "@/components/AuthCheck";
import Shelf from "@/components/shelf";

// import styling
import styles from "./page.module.css";

export default function Home() {
  return (
    <NextUIProvider>
      <main className={styles.main}>
        <AuthCheck>
          <div className={styles.signInContainer}>
            <Profile />
          </div>
          <Shelf />
        </AuthCheck>
      </main>
    </NextUIProvider>
  );
}
