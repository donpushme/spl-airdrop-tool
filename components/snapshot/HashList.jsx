import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect, useCallback } from "react";
import { TablePagination } from "../TablePagination";
import { Button } from "../ui/button";
import { DownloadIcon, RocketIcon } from "../Assests/icons/Icon";
import { downloadNftAsCsv, downloadObjectAsJson } from "@/lib/utils";
import { useRouter } from "next/navigation";

const initialArray = new Array(100).fill(1);

export default function HashList(props) {
  const router = useRouter()
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [rowArray, setRowArray] = useState(initialArray);
  const { list } = props;

  useEffect(() => {
    const totalLength = list.length;
    const rows = rowsPerPage;
    const addition = totalLength % rows == 0 ? 0 : 1;
    const pageNum = Math.floor(totalLength / rows) + addition;
    setPages(pageNum);
  }, [list, rowsPerPage, setPages]);

  useEffect(() => {
    const array = new Array(rowsPerPage).fill(1);
    setRowArray(array);
  }, [rowsPerPage, setRowArray]);

  const downloadAsJson = useCallback(() => {
    console.log("downloading");
    if (list.length > 0) downloadObjectAsJson(list, "hash_list");
  }, [list]);

  const downloadAsCsv = useCallback(() => {
    if (list.length > 0) downloadNftAsCsv(list, "hash_list");
  }, [list]);

  if (list?.length) {
    return (
      <div className="border p-4 mt-8 rounded-xl">
        <div className="flex justify-between items-center">
          <div>{`${list.length} NFTS`}</div>
          <div className="flex gap-4">
            <Button className="flex gap-4" onClick={downloadAsJson}>
              <DownloadIcon size={20} />
              Download
            </Button>
            <Button className="flex gap-4" onClick={() => {
              router.push("/airdrop/inputfile")
            }}>
              <RocketIcon size={20} />
              Airdrop
            </Button>
          </div>
        </div>
        <div className="overflow-auto mt-4 rounded scrollbar h-[500px] pr-4">
          <Table className='border w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">No</TableHead>
                <TableHead className="w-3/4">Mint Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowArray?.map((item, index) => {
                if (
                  typeof list[rowsPerPage * (page - 1) + index] == "undefined"
                )
                  return;
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {rowsPerPage * (page - 1) + index + 1}
                    </TableCell>
                    <TableCell className="truncate w-3/4">
                      {list[rowsPerPage * (page - 1) + index]}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <TablePagination pages={pages} page={page} setPage={setPage} />
        </div>
      </div>
    );
  } else return <></>;
}
