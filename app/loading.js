import Loader from "@/components/loader";

export default function Loading() {
  return (
    <div className=" bg-gradient-to-b from-[#D6DBDC] to-white h-dvh content-center">
      <Loader
        containerStyle={{
          display: "flex",
          width: "100%",
          height: "100%",
          justifyContent: "center",
        }}
      />
    </div>
  );
}
