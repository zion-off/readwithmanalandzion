"use client";

// import components
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import Loader from "@/components/loader";

// import styling
import { Archivo } from "@/assets/fonts/fonts";
import styles from "./buttons.module.css";

export function SignInButton({ style }) {
  const { data: session, status } = useSession();
  console.log(session, status);

  if (status === "loading") {
    return <Loader />;
  }

  if (status === "authenticated") {
    return (
      <Link href={`/`}>
        <Image
          src={session.user?.image ?? "avatar.png"}
          width={40}
          height={40}
          alt="Name"
          style={style}
        />
      </Link>
    );
  }

  return (
    <button
      className={`${styles.button} ${styles.signin}`}
      onClick={() => signIn()}>
      <Image
        src={"./arrow.svg"}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "100%", height: "auto", padding: "10%" }}
        alt="Sign in"
      />
    </button>
  );
}

export function SignOutButton() {
  return (
    <div
      onClick={() => signOut()}
      className={`${styles.signOut} ${Archivo.className}`}>
      Sign out
    </div>
  );
}

export function AddButton() {
  return (
    <button className={`${styles.button} ${styles.add}`}>
      <Image
        src={"./add.svg"}
        width={0}
        height={0}
        sizes="100vw"
        style={{ width: "100%", height: "auto", padding: "10%" }}
        alt="Add"
      />
    </button>
  );
}
