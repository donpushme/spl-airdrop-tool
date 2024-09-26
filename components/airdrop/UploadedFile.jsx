
import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from 'react';
import Spinner from "../Assests/spinner/Spinner";
import { FileRecordIcon, SortIcon } from "../Assests/icons/Icon";
import { sortList } from "@/lib/utils";

export default function UploadedFile({ files, setShowUpload, isLoading, changeFile }) {
    const newRef = useRef(null); // Typing the ref correctly
    const [filteredFiles, setFilteredFiles] = useState(files);
    const [filterValue, setFilterValue] = useState("");
    const [sortType, setSortType] = useState(false);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (newRef.current && !newRef.current.contains(e.target)) {
                closeMenu()
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []); // Ensure the effect has an empty dependency array to prevent it from running on every render

    const closeMenu = () => {
        setShowUpload(false)
    }

    const filter = useCallback(() => {
        if (!files || files.length == 0 || typeof files == "undefined") return
        const filtered = files.filter((file) => file.token.toLowerCase().includes(filterValue.toLowerCase()));
        setFilteredFiles(filtered)
    }, [files, setFilteredFiles, filterValue])

    const keyPressHandler = (e) => {
        if (e.key == "Enter") filter()
    }

    const selectToken = (file) => {
        changeFile(file)
        closeMenu();
    }

    const sort = useCallback(() => {
        console.log(sortType)
        if (!filteredFiles || filteredFiles.length == 0 || typeof filteredFiles == "undefined") return
        sortList(filteredFiles, "date", sortType);
        setSortType((pre) => !pre)
    }, [filteredFiles, sortType, setSortType])

    return (
        <div className="absolute top-full bg-background w-[calc(100%-120px)] border rounded-sm p-2 z-50" ref={newRef}>
            {!isLoading && filteredFiles.length > 0 &&
                <div className="flex justify-between items-center px-4">
                    <div>{`${filteredFiles?.length} Snapshot`}</div>
                    <div className="flex gap-2">
                        <input className="h-10 rounded bg-transparent border p-2" value={filterValue} onChange={(e) => { setFilterValue(e.target.value) }} onKeyDown={keyPressHandler} />
                        <button className="h-10 rounded text-xs px-4 bg-primary-foreground/50 hover:cursor-pointer" onClick={filter}>Search</button>
                        <button className="h-10 rounded p-2 bg-primary-foreground/50 hover:cursor-pointer" onClick={sort}><SortIcon /> </button>
                    </div>
                </div>}
            <div className="scrollbar overflow-auto max-h-[200px] p-2">
                {isLoading ? <div className="mx-auto">
                    <Spinner />
                </div> : <div>
                    {filteredFiles?.map((file, index) => {
                        const type = file.type == 1 ? "single" : "combined";
                        const date = new Date(file?.date);
                        return (
                            <div className="flex gap-4 text-xs items-center w-full border-b p-2 hover:cursor-pointer hover:bg-primary/10" key={index} onClick={() => selectToken(file)}>
                                <div className="relative aspect-square w-[30px] rounded-full">
                                    <FileRecordIcon size={10} />
                                </div>
                                <div className="w-9/12">
                                    <div className="flex gap-2">
                                        <div>{file.token}</div>
                                        <div className="text-gray-500">{`(${type})`}</div>
                                    </div>
                                    <div>
                                        {file?.length}
                                    </div>
                                </div>
                                <div className="w-3/12 text-right">{date.toDateString()}</div>
                            </div>
                        )
                    })}
                </div>}
            </div>
        </div>
    )
}