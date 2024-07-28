import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { TablePagination } from "../TablePagination";

const initialArray = new Array(100).fill(1)

export default function NftTble(props) {
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(1000);
  const [rowArray, setRowArray] = useState(initialArray);
  const { nfts } = props;

  useEffect(() => {
    const totalLength = nfts.length;
    const rows = rowsPerPage;
    const addition = totalLength % rows == 0 ? 0 : 1;
    const pageNum = Math.floor(totalLength / rows) + addition;
    setPages(pageNum);
  }, [nfts, rowsPerPage, setPages]);

  useEffect(() => {
    const array = new Array(rowsPerPage).fill(1);
    setRowArray(array);
  }, [rowsPerPage, setRowArray])

  if (nfts?.length) {
    return (
      <div className="w-3/4 mx-auto mt-4 p-4 border border-green rounded">
        <Table>
          <TableCaption>NFT List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Mint</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowArray?.map((item, index) => {
              if(typeof nfts[rowsPerPage * (page - 1) + index] == 'undefined') return
              return (
                <TableRow key={index}>
                  <TableCell>{rowsPerPage * (page - 1) + index + 1}</TableCell>
                  <TableCell>{nfts[rowsPerPage * (page - 1) + index]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination pages={pages} page={page} setPage={setPage} />
      </div>
    );
  } else return <></>;
}
