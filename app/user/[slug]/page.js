"use client";

// import components
import Essay from "@/components/essay";
import EssayDetail from "@/components/essayDetail";
import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

// import styles
import styles from "./page.module.css";

export default function UserPage({ params }) {
  const [essays, setEssays] = useState([]);
  const [selectedEssay, setSelectedEssay] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const dynamicSlug = decodeURIComponent(params.slug);

  const handleEssayClick = (essay) => {
    setSelectedEssay(essay);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEssay(null);
  };

  useEffect(() => {
    const fetchEssays = async () => {
      console.log(dynamicSlug);
      try {
        const q = query(
          collection(db, "essays"),
          where("userEmail", "==", dynamicSlug),
          where("checked", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const essayList = [];
        querySnapshot.forEach((doc) => {
          essayList.push({ id: doc.id, ...doc.data() });
        });
        essayList.sort((b, a) => b.createdAt - a.createdAt);
        setEssays(essayList);
      } catch (error) {
        console.error("Error fetching essays: ", error);
      }
    };

    fetchEssays();
    console.log(essays);
  }, []);
  return (
    <div className={styles.main}>
      <div className={styles.essayContainer}>
        {essays.map((essay) => (
          <div>
            <Essay
              key={essay.id}
              title={essay.title}
              author={essay.author}
              cover={essay.cover}
              onClick={() => handleEssayClick(essay)}
            />
          </div>
        ))}
      </div>
      {showModal && selectedEssay && (
        <EssayDetail
          key={selectedEssay.id}
          id={selectedEssay.id}
          title={selectedEssay.title}
          author={selectedEssay.author}
          notes={selectedEssay.notes}
          link={selectedEssay.link}
          fileURL={selectedEssay.fileURL}
          closeModal={closeModal}
          slug={true}
          imageSource="./close.svg"
        />
      )}
    </div>
  );
}
