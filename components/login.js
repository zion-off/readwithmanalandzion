// import components
import { useState, useEffect } from "react";
import { SignInButton } from "./buttons";

// import styling
import styles from "./login.module.css";

const getGreeting = () => {
  const currentHour = new Date().getHours();
  if (currentHour < 12) {
    return "morning!";
  } else if (currentHour < 18) {
    return "afternoon.";
  } else {
    return "evening.";
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
        <h1 className={`sfProDisplay ${styles.heading}`}>
          manal and zion, good {greeting}
        </h1>
        <h1 className={`sfProDisplay ${styles.subheading}`}>
          everyone else {greeting.slice(0, -1)} 😒
        </h1>
      </div>
      <div className={styles.button}>
        <SignInButton />
      </div>
    </div>
  );
}
