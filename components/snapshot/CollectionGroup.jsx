import dynamic from "next/dynamic";

const Collection = dynamic(() => import("@/components/snapshot/Collection"), {
  ssr: false,
  loading: () => (
    <div className=" w-[70px] aspect-square rounded bg-gray-300/20"></div>
  ),
});

export default function CollectionGroup({collectionList}) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4 justify-around rounded-[6px] bg-gray-700/5 p-2 max-h-[300px] overflow-auto scrollbar">
      {collectionList.map((collection, index) => {
        return <Collection collection={collection} key={index} />;
      })}
    </div>
  );
}
