import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "../TablePagination";
import { useState, useCallback, useEffect } from "react";
import { Button } from "../ui/button";
import { RocketIcon, DownloadIcon, SortIcon } from "../Assests/icons/Icon";
import { sortList } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { downloadOwnersAsCsv } from "@/lib/utils";

const initialArray = new Array(100).fill(1);

export default function FTOwnerTable(props) {
  const router = useRouter();
  const { holderList, setHolderList } = props;
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [rowArray, setRowArray] = useState(initialArray);
  const [sortType, setSortType] = useState(false)

  useEffect(() => {
    const totalLength = holderList.length;
    const rows = rowsPerPage;
    const addition = totalLength % rows == 0 ? 0 : 1;
    const pageNum = Math.floor(totalLength / rows) + addition;
    setPages(pageNum);
  }, [holderList, rowsPerPage, setPages]);

  useEffect(() => {
    const array = new Array(rowsPerPage).fill(1);
    setRowArray(array);
  }, [rowsPerPage, setRowArray]);

  const downloadAsCsv = useCallback(() => {
    if (holderList.length > 0) downloadOwnersAsCsv(holderList, "token_holder_list");
  }, [holderList]);

  const sort = useCallback(
    () => {
      setHolderList(sortList(holderList, 'balance', sortType));
      setSortType((pre) => !pre)
    },
    [sortType]
  );

  if (holderList?.length) {
    return (
      <div className="border p-4 mt-8 rounded-xl">
        <div className="flex justify-between items-center">
          <div>{`${holderList.length} wallets`}</div>
          <div className="flex gap-4">
            <Button className="flex gap-4 h-10" onClick={downloadAsCsv}>
              <DownloadIcon size={20} />
              Download
            </Button>
            <Button
              className="flex gap-4 h-10"
              onClick={() => {
                router.push("/airdrop/inputfile");
              }}
            >
              <RocketIcon size={20} />
              Airdrop
            </Button>
          </div>
        </div>
        <div className="overflow-auto mt-4 rounded scrollbar h-[500px] pr-4">
          <Table className="border w-full">
            <TableCaption>Token Owner List</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>
                  <div className="flex justify-between">
                    <div>Balance</div>
                    <SortIcon className="hover:cursor-pointer" onClick={sort}/>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowArray?.map((item, index) => {
                if (
                  typeof holderList[rowsPerPage * (page - 1) + index] ==
                  "undefined"
                )
                  return;
                return (
                  <TableRow key={index}>
                    <TableCell>
                      {rowsPerPage * (page - 1) + index + 1}
                    </TableCell>
                    <TableCell>
                      {holderList[rowsPerPage * (page - 1) + index].owner}
                    </TableCell>
                    <TableCell>
                      {holderList[rowsPerPage * (page - 1) + index].balance}
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
