
import Image from "next/image"
import { useState, useRef, useEffect } from 'react';
import Spinner from "../Assests/spinner/Spinner";
import { FileRecordIcon } from "../Assests/icons/Icon";


export default function UploadedFile({ files, setShowUpload, isLoading, setFileId }) {
    const newRef = useRef(null); // Typing the ref correctly

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

    const selectToken = (fileId) => {
        setFileId(fileId);
        closeMenu();
    }

    return (
        <div className="absolute top-full bg-background w-[calc(100%-120px)] border rounded-sm p-2 z-50" ref={newRef}>
            <div className="scrollbar overflow-auto max-h-[200px] p-2">
                {isLoading ? <div className="mx-auto">
                    <Spinner />
                </div> : <div>
                    {files?.map((file, index) => {
                        console.log(file)
                        const type = file.type == 1 ? "single" : "combined"
                        return (
                            <div className="flex gap-2 text-xs items-center w-full border-b p-2 hover:cursor-pointer hover:bg-primary/10" key={index} onClick={() => selectToken((file._id))}>
                                <div className="relative aspect-square w-[30px] rounded-full">
                                    <FileRecordIcon size={10}/>
                                </div>
                                <div className="w-9/12 flex gap-4">
                                    <div>{file.token}</div>
                                    <div className="text-gray-500">{`(${type})`}</div>
                                </div>
                                <div className="w-3/12 text-right">{file?.length}</div>
                            </div>
                        )
                    })}
                </div>}
            </div>
        </div>
    )
}