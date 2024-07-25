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
import { TablePagination } from "./TablePagination";

const initialArray = new Array(100).fill(1)

export default function NftOwners(props) {
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [rowArray, setRowArray] = useState(initialArray);
  const { owners } = props;

  useEffect(() => {
    const totalLength = owners.length;
    const rows = rowsPerPage;
    const addition = totalLength % rows == 0 ? 0 : 1;
    const pageNum = Math.floor(totalLength / rows) + addition;
    setPages(pageNum);
  }, [owners, rowsPerPage, setPages]);

  useEffect(() => {
    const array = new Array(rowsPerPage).fill(1);
    setRowArray(array);
  }, [rowsPerPage, setRowArray])
  

  if (owners?.length) {
    const properties = Object.keys(owners[0]);
    return (
      <div className="w-3/4 mx-auto mt-4 p-4 border border-green rounded">
        <Table>
          <TableCaption>NFT Holder List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">No</TableHead>
              {properties.map((item, key) => {
                return (
                  <TableHead className="capitalize text-center" key={key}>
                    {item}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody className="text-center">
            {rowArray?.map((num, index) => {
              if(typeof owners[rowsPerPage * (page - 1) + index] == "undefined") return;
              return (
                <TableRow key={index}>
                  <TableCell className="h-8 p-1">{rowsPerPage * (page - 1) + index + 1}</TableCell>
                  {properties.map((item, key) => {
                    return (
                      <TableCell className="h-8 p-1" key={key}>
                        {owners[rowsPerPage * (page - 1) + index][item]}
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
    );
  } else return <></>;
}
