
import Image from "next/image"
import { useState, useRef, useEffect } from 'react';
import Spinner_1 from "../Assests/spinner/Spinner_1";
import Spinner from "../Assests/spinner/Spinner";


export default function UploadedFile({ files, setShowUpload, isLoading, setFileId }) {
    const newRef = useRef(null); // Typing the ref correctly
    const [fileText, setFileText] = useState("")

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

    // const { tokens, loading, error } = useWalletTokens();
    console.log(files)
    return (
        <div className="absolute top-full bg-background w-[calc(100%-120px)] border rounded-sm p-2" ref={newRef}>
            <div className="scrollbar max-h-[200px] p-2">
                {isLoading ? <div className="mx-auto">
                    <Spinner />
                </div> : <div className="">
                    {files.map((file, index) => {
                        return (
                            <div className="flex gap-2 text-xs items-center w-full border-b p-2 hover:cursor-pointer" key={index} onClick={() => selectToken((file.id))}>
                                <div className="relative aspect-square w-[30px] rounded-full">
                                    <Image className="rounded-full" src="/token/solana.png" fill alt="" />
                                </div>
                                <div className="w-9/12">
                                    <div>{file.symbol}</div>
                                    <div className="text-gray-500"></div>
                                </div>
                                <div className="w-3/12 text-right"></div>
                            </div>
                        )
                    })}
                </div>}
            </div>
        </div>
    )
}