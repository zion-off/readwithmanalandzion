"use client";

// import components
import Essay from "./essay";
import EssayDetail from "./essayDetail";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@nextui-org/react";

// import styling
import styles from "./shelf.module.css";

export default function Shelf({ refresh }) {
  const { data: session, status } = useSession();
  const [essays, setEssays] = useState([]);
  const [selectedEssay, setSelectedEssay] = useState(null);
  const [saved, setSaved] = useState(false);
  const [itemDeleted, setItemDeleted] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    const fetchEssays = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const q = query(
            collection(db, "essays"),
            where("userEmail", "==", session.user.email)
          );
          const querySnapshot = await getDocs(q);
          const essayList = [];
          querySnapshot.forEach((doc) => {
            essayList.push({ id: doc.id, ...doc.data() });
          });
          // sort essays by createdAt date
          essayList.sort((b, a) => b.createdAt - a.createdAt);
          setEssays(essayList);
        } catch (error) {
          console.error("Error fetching essays: ", error);
        }
      }
    };

    fetchEssays();
    console.log(essays);
  }, [status, session, refresh, saved, itemDeleted]);

  const handleEssayClick = (essay) => {
    console.log("got here");
    setSelectedEssay(essay);
    console.log(selectedEssay);
    onOpen();
  };

  const handleSaved = (updatedEssay) => {
    setSaved(!saved);
    setEssays((prevEssays) =>
      prevEssays.map((essay) =>
        essay.id === updatedEssay.id ? updatedEssay : essay
      )
    );
    setSelectedEssay(updatedEssay);
  };

  const handleDeleted = () => {
    setItemDeleted(!itemDeleted);
  };

  return (
    <div>
      <div className={styles.main}>
        {essays.map((essay) => (
          <Essay
            key={essay.id}
            title={essay.title}
            author={essay.author}
            cover={essay.cover}
            onClick={() => handleEssayClick(essay)}
          />
        ))}
      </div>
      <EssayDetail
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        id={selectedEssay?.id}
        title={selectedEssay?.title}
        author={selectedEssay?.author}
        notes={selectedEssay?.notes}
        link={selectedEssay?.link}
        checked={selectedEssay?.checked}
        fileURL={selectedEssay?.fileURL}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
