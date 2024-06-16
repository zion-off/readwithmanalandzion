// import components
import { useState, useEffect } from "react";
import { SignInButton } from "./buttons";

// import styling
import { ClashDisplay, Archivo } from "@/assets/fonts/fonts";
import styles from "./login.module.css";

const getGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return "good morning!";
  } else if (currentHour < 18) {
    return "good afternoon.";
  } else {
    return "good evening.";
  }
};

export default function LoginPage() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.text}>
        <h1 className={`${ClashDisplay.className} ${styles.heading}`}>
          manal and zion, {greeting}
        </h1>
        <h1 className={`${Archivo.className} ${styles.subheading}`}>
          keep reading!
        </h1>
      </div>
      <div className={styles.button}>
        <SignInButton />
      </div>
    </div>
  );
}
