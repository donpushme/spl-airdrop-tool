import { useState } from "react"
import SearchBar from "./SearchBar"
import CollectionGroup from "@/components/snapshot/CollectionGroup"
import { collections } from "@/lib/collections";

export default function Collections() {
  const [collectionList, setCollectionList] = useState(collections);

  return (
    <div className="border rounded-[6px] p-2 w-[95%] md:w-[700px] lg:w-7/12 mx-auto">
      <div className="flex justify-between items-center p-2">
        <div>
          Choose from collections
        </div>
        <SearchBar setCollectionList={setCollectionList} />
      </div>
      <CollectionGroup collectionList={collectionList}/>
    </div>
  )
}