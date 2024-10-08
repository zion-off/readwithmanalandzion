"use client";

// import dependencies
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
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
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";

// import components
import Profile from "@/components/profile";
import Loader from "./loader";
import Essay from "./essay";
import EssayDetail from "./essayDetail";
import AddEssay from "@/components/addEssay";
import { Input } from "@nextui-org/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  Chip,
} from "@nextui-org/react";

// import styling
import styles from "./shelf.module.css";

export default function Shelf() {
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
  const itemsPerPage = 20;
  const [refresh, setRefresh] = useState(false);
  const [usingAI, setUsingAI] = useState(false);
  const [chipColor, setChipColor] = useState("primary");
  const [response, setResponse] = useState("");
  const [aiResponseGenerating, setAIResponseGenerating] = useState(false);
  const [keywordSearch, setKeywordSearch] = useState("");

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const scrollParentRef = useRef(null);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

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

  const askAI = async () => {
    setAIResponseGenerating(true);
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: searchQuery }),
    });

    const result = await res.json();
    setResponse(result.message);
    setAIResponseGenerating(false);
    console.log(result.message);
  };

  const keyDown = (event) => {
    if (
      searchQuery === "" &&
      chipColor === "primary" &&
      event.key === "Backspace" &&
      usingAI
    ) {
      setChipColor("default");
    } else if (
      searchQuery === "" &&
      chipColor === "default" &&
      event.key === "Backspace" &&
      usingAI
    ) {
      setUsingAI(false);
      setChipColor("primary");
      setResponse(null);
    } else if (
      searchQuery === "" &&
      chipColor === "default" &&
      event.key === "ArrowRight"
    ) {
      setChipColor("primary");
    } else if (searchQuery !== "" && usingAI && chipColor === "default") {
      setChipColor("primary");
    } else if (event.key === "Enter" && usingAI) {
      askAI();
    }
  };

  const debounce = useCallback((func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((query) => setKeywordSearch(query), 500),
    [debounce]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    const lowerCaseQuery = keywordSearch.toLowerCase();
    if (searchQuery !== "/" && searchQuery !== "/a" && !usingAI) {
      setFilteredEssays(
        essays.filter(
          (essay) =>
            essay.title.toLowerCase().includes(lowerCaseQuery) ||
            essay.author.toLowerCase().includes(lowerCaseQuery) ||
            essay.notes.toLowerCase().includes(lowerCaseQuery) ||
            essay.link?.toLowerCase().includes(lowerCaseQuery)
        )
      );
    }
  }, [keywordSearch, essays]);

  useEffect(() => {
    if (searchQuery === "/ai") {
      setSearchQuery("");
      setUsingAI(true);
    }
  }, [searchQuery, essays]);

  return (
    <div
      className={styles.container}
      //  ref={scrollParentRef}
    >
      <div
        className="flex flex-col items-center w-full sticky z-10 gap-2 align-middle"
        style={{ top: "10px" }}
      >
        <div
          className="flex flex-row w-full items-center gap-5"
          style={{ position: "sticky", top: "5px" }}
        >
          <div className="gap-1 px-5 w-full flex justify-center backdrop-blur-xl bg-white/30 p-2 rounded-2xl align-middle">
            <Input
              value={searchQuery}
              onKeyDown={keyDown}
              type="text"
              placeholder="Search or type /ai to ask AI"
              classNames={{
                base: "sfProDisplay bg-transparent shadow-none group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
                label: "bg-transparent shadow-none",
                inputWrapper:
                  "place-self-center px-0 bg-transparent shadow-none group-data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent group-data-[focus=true]:shadow-none",
              }}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={
                <AnimatePresence>
                  {usingAI && (
                    <motion.div
                      initial={{ x: -200, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Chip color={chipColor}>ask manal and zion</Chip>
                    </motion.div>
                  )}
                </AnimatePresence>
              }
              endContent={
                usingAI ? (
                  <Button
                    size="sm"
                    isIconOnly
                    onPress={askAI}
                    className="place-self-center rounded-full bg-zinc-900 focus:outline-none active:scale-95 transition duration-200 sm:hover:rotate-90 hover:duration-500 hover:ease"
                  >
                    <Image
                      src={"./arrow.svg"}
                      width={0}
                      height={0}
                      style={{
                        width: "90%",
                        height: "90%",
                        padding: "10%",
                      }}
                      alt="Arrow"
                    />
                  </Button>
                ) : (
                  <div className="flex flex-row gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          className="place-self-center bg-zinc-900 col text-gray-100 p-1"
                        >
                          <Image
                            src={"./sort.svg"}
                            width={0}
                            height={0}
                            style={{
                              width: "90%",
                              height: "90%",
                              padding: "10%",
                            }}
                            alt="Arrow"
                          />
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
                    <AddEssay onRefresh={handleRefresh} />
                  </div>
                )
              }
            />
          </div>
          {/*  */}

          <div className="sticky top-5">
            <Profile />
          </div>
        </div>
        <div className="w-full">
          {(aiResponseGenerating || response) && (
            <AnimatePresence>
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="sfProDisplay shadow-2xl z-10 w-full flex justify-center backdrop-blur-xl bg-white/90 p-10 mt-5 rounded-2xl"
              >
                {aiResponseGenerating ? (
                  <Loader
                    circleStyle={{
                      maxHeight: "10px",
                      maxWidth: "10px",
                    }}
                  />
                ) : (
                  <Markdown className="flex flex-col">
                    {response.toLocaleLowerCase()}
                  </Markdown>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <div
        ref={scrollParentRef}
        className="absolute h-screen overflow-auto left-1/2 transform -translate-x-1/2 bottom-0 w-full pb-10 px-[6vw] md:pt-36 pt-44"
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
