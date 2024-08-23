import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { searchInCollection } from "@/lib/collections";

export default function SearchBar({setCollectionList}) {
  const [searchValue, setSearchValue] = useState("");
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    const result = searchInCollection(value);
    console.log(result)
    setCollectionList(result);
  };

  return (
    <div className="flex gap-4">
      <Input
        placeholder="Search Collection"
        className="w-[200px] h-10"
        value={searchValue}
        onChange={handleSearch}
      />
      <Button className="h-10">Search</Button>
    </div>
  );
}
