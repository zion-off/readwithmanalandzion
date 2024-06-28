"use client";

// import dependencies
import { useEffect, useState, useMemo, useRef } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import { useSession } from "next-auth/react";
import { useDisclosure } from "@nextui-org/react";
import InfiniteScroll from "react-infinite-scroller";

// import components
import Loader from "./loader";
import Essay from "./essay";
import EssayDetail from "./essayDetail";
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
  const [selectedKeys, setSelectedKeys] = useState(new Set(["newest"]));
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 10;
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const scrollParentRef = useRef(null);

  const loadMore = (page) => {
    fetchEssays(page, selectedValue.toLowerCase());
  };

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", ").replaceAll("_", " "),
    [selectedKeys]
  );

  const fetchEssays = async (pageNum = 0, sortBy = "createdAt") => {
    if (status === "authenticated" && session?.user?.email) {
      try {
        let q = query(
          collection(db, "essays"),
          where("userEmail", "==", session.user.email)
        );
  
        // Apply sorting based on the sortBy parameter
        switch (sortBy) {
          case "title":
            q = query(q, orderBy("title"));
            break;
          case "author":
            q = query(q, orderBy("author"));
            break;
          case "newest":
            q = query(q, orderBy("createdAt", "desc"));
            break;
          case "oldest":
            q = query(q, orderBy("createdAt", "asc"));
            break;
          default:
            q = query(q, orderBy("createdAt", "desc"));
        }
  
        // Apply pagination
        q = query(q, limit(itemsPerPage * (pageNum + 1)));
  
        const querySnapshot = await getDocs(q);
        const essayList = [];
        querySnapshot.forEach((doc) => {
          essayList.push({ id: doc.id, ...doc.data() });
        });
        setEssays(essayList);
        setFilteredEssays(essayList);
        setHasMore(essayList.length === itemsPerPage * (pageNum + 1));
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching essays: ", error);
      }
    }
  };

  useEffect(() => {
    fetchEssays(0, selectedValue.toLowerCase());
  }, [status, session, refresh, saved, itemDeleted, selectedValue]);

  const handleEssayClick = (essay) => {
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

  return (
    <div
      className={styles.container}
      //  ref={scrollParentRef}
    >
      <div className="flex justify-center">
        <div className="z-10 sm:w-3/4 w-full flex justify-center gap-2 backdrop-blur-xl bg-white/30 p-2 mb-10 rounded-2xl">
          <Input
            isClearable
            radius="full"
            type="text"
            placeholder="Search..."
            classNames={{
              label: "object-fill w-full bg-transparent shadow-none",
              input:
                "object-fill w-full bg-transparent  shadow-none group-data-[focus=true]:bg-transparent",
              innerWrapper: "object-fill w-full bg-transparent  shadow-none",
              inputWrapper:
                "object-fill w-full bg-transparent  shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button className="capitalize bg-zinc-900 col text-gray-100">
                Sort
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              variant="flat"
              disallowEmptySelection
              selectionMode="single"
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
            >
              <DropdownItem key="title">Title</DropdownItem>
              <DropdownItem key="author">Author</DropdownItem>
              <DropdownItem key="newest">Newest</DropdownItem>
              <DropdownItem key="oldest">Oldest</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div
        ref={scrollParentRef}
        style={{
          position: "absolute",
          height: "100vh",
          overflow: "auto",
          left: "50%",
          transform: "translateX(-50%)",
          bottom: "0",
          width: "100%",
          padding: "30vh 6vw 0 6vw",
        }}
      >
        <InfiniteScroll
          pageStart={0}
          loadMore={loadMore}
          hasMore={hasMore}
          loader={
            <div className="w-full flex justify-center" key={0}>
              <Loader
                circleStyle={{
                  maxHeight: "10px",
                  maxWidth: "10px",
                }}
              />
            </div>
          }
          useWindow={false}
          getScrollParent={() => scrollParentRef.current}
          threshold={250}
        >
          <div className={styles.main}>
            {filteredEssays.map((essay) => (
              <Essay
                key={essay.id}
                title={essay.title}
                author={essay.author}
                cover={essay.cover}
                favicon={essay.favicon}
                onClick={() => handleEssayClick(essay)}
              />
            ))}
          </div>
        </InfiniteScroll>
      </div>

      <EssayDetail
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        id={selectedEssay?.id}
        title={selectedEssay?.title}
        author={selectedEssay?.author}
        notes={selectedEssay?.notes}
        link={selectedEssay?.link}
        favicon={selectedEssay?.favicon}
        checked={selectedEssay?.checked}
        fileURL={selectedEssay?.fileURL}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
      />
    </div>
  );
}
