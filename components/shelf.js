"use client";

// import components
import Essay from "./essay";
import EssayDetail from "./essayDetail";
import { useEffect, useState, useMemo } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from "@nextui-org/react";

// import styling
import styles from "./shelf.module.css";

export default function Shelf({ refresh }) {
  const { data: session, status } = useSession();
  const [essays, setEssays] = useState([]);
  const [filteredEssays, setFilteredEssays] = useState([]);
  const [selectedEssay, setSelectedEssay] = useState(null);
  const [saved, setSaved] = useState(false);
  const [itemDeleted, setItemDeleted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set(["text"]));

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

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
          setFilteredEssays(essayList);
        } catch (error) {
          console.error("Error fetching essays: ", error);
        }
      }
    };

    fetchEssays();
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

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredEssays(essays);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      setFilteredEssays(
        essays.filter(
          (essay) =>
            essay.title.toLowerCase().includes(lowerCaseQuery) ||
            essay.author.toLowerCase().includes(lowerCaseQuery) ||
            essay.notes.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [searchQuery, essays]);

  useEffect(() => {
    sortEssays(filteredEssays);
  }, [selectedValue]);

  const sortEssays = (essaysToSort) => {
    console.log(selectedValue);
    switch (selectedValue) {
      case "title":
        essaysToSort.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "author":
        essaysToSort.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case "newest":
        essaysToSort.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "oldest":
        essaysToSort.sort((a, b) => a.createdAt - b.createdAt);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.container}>
      <div className="w-100 flex justify-center gap-2">
        <Input
          isClearable
          radius="full"
          type="text"
          placeholder="Search..."
          className="mb-10 object-fill sm:w-2/4 sm:max-w-[400px]"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dropdown>
          <DropdownTrigger>
            <Button variant="ghost" className="capitalize">
              Sort
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Single selection example"
            variant="flat"
            disallowEmptySelection
            selectionMode="single"
            selectedKeys={selectedKeys}
            defaultSelectedKeys={"title"}
            onSelectionChange={setSelectedKeys}>
            <DropdownItem key="title">Title</DropdownItem>
            <DropdownItem key="author">Author</DropdownItem>
            <DropdownItem key="newest">Newest</DropdownItem>
            <DropdownItem key="oldest">Oldest</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className={styles.main}>
        {filteredEssays.map((essay) => (
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
