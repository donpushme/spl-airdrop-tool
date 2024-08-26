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
import { DownloadIcon, RocketIcon, SortIcon } from "../Assests/icons/Icon";
import {
  downloadOwnersAsCsv,
  downloadObjectAsJson,
  sortList,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { isValidSolanaAddress } from "@/lib/solana";

const initialArray = new Array(100).fill(1);

export default function HolderList(props) {
  const router = useRouter();
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [rowArray, setRowArray] = useState(initialArray);
  const { list, setList, newAddress, setNewAddress, getHolderlist } = props;
  const [sortTypes, setSortTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    if (!list || list.length == 0) return;
    const totalLength = list.length;
    const rows = rowsPerPage;
    const addition = totalLength % rows == 0 ? 0 : 1;
    const pageNum = Math.floor(totalLength / rows) + addition;
    setProperties(Object.keys(list[0]));
    setSortTypes(new Array(Object.keys(list[0]).length).fill(false));
    setPages(pageNum);
  }, [list, rowsPerPage, setPages]);

  useEffect(() => {
    const array = new Array(rowsPerPage).fill(1);
    setRowArray(array);
  }, [rowsPerPage, setRowArray]);

  const downloadAsJson = useCallback(() => {
    if (list.length > 0) downloadObjectAsJson(list, "nft_holder_list");
  }, [list]);

  const downloadAsCsv = useCallback(() => {
    if (list.length > 0) downloadOwnersAsCsv(list, "nft_holder_list");
  }, [list]);

  const combine = () => {
    console.log(isValidSolanaAddress(newAddress));
    if (isValidSolanaAddress(newAddress)) {
      getHolderlist(newAddress);
    }
  };

  const sort = useCallback(
    (key) => {
      setList(sortList(list, properties[key], sortTypes[key]));
      setSortTypes((pre) => {
        console.log(key);
        const newValue = pre[key]==false ? true: false;
        console.log(newValue)
        const temp = pre.with(key, newValue);
        return temp;
      });
    },
    [list, properties, sortTypes]
  );

  if (list?.length) {
    return (
      <div className="border p-4 mt-8 rounded-xl">
        <div className="flex justify-between items-center">
          <div>{`${list.length} Holders`}</div>
          <div className="flex gap-4">
            <div>
              <Input
                placeholder="MCC / NFT Address"
                value={newAddress}
                onChange={(e) => {
                  setNewAddress(e.target.value);
                }}
              />
            </div>
            <Button className="h-10" onClick={combine}>
              Combine
            </Button>
            <Button className="flex gap-4 h-10" onClick={downloadAsCsv}>
              <DownloadIcon size={20} />
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
          <Table className="border">
            <TableCaption>NFT Holder List</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="">No</TableHead>
                {properties.map((item, key) => {
                  return (
                    <TableHead className="capitalize text-left" key={key}>
                      <div className="flex justify-between">
                        <div>{item}</div>
                        {key > 0 && (
                          <SortIcon
                            className="hover:cursor-pointer"
                            onClick={() => {
                              sort(key);
                            }}
                          />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody className="text-left">
              {rowArray?.map((num, index) => {
                if (
                  typeof list[rowsPerPage * (page - 1) + index] == "undefined"
                )
                  return;
                return (
                  <TableRow key={index}>
                    <TableCell className="h-8 py-1 px-4">
                      {rowsPerPage * (page - 1) + index + 1}
                    </TableCell>
                    {properties.map((item, key) => {
                      return (
                        <TableCell className="h-8 py-1 px-4" key={key}>
                          {list[rowsPerPage * (page - 1) + index][item]}
                        </TableCell>
                      );
                    })}
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
