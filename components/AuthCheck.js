"use client";

// import components
import { useSession } from "next-auth/react";
import Loader from "@/components/loader";
import LoginPage from "./login";

// import styling
import styles from "./AuthCheck.module.css";

export default function AuthCheck({ children }) {
  const { data: session, status } = useSession();

  console.log(session, status);

  if (status === "authenticated") {
    return <>{children}</>;
  } else if (status === "loading") {
    return <div className={styles.loader}>
      <Loader />
    </div>;
  } else {
    return <LoginPage />;
  }
}
