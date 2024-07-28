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
import { useState, useEffect } from "react";

const initialArray = new Array(100).fill(1)

export default function FTOwnerTable(props) {
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(1000);
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

  if (list?.length) {
    return (
      <div className="w-3/4 mx-auto mt-4 p-4 border border-green rounded backdrop-blur-lg">
        <Table>
          <TableCaption>Token Owner List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {rowArray?.map((item, index) => {
              if(typeof list[rowsPerPage * (page - 1) + index] == 'undefined') return
              return (
                <TableRow key={index}>
                  <TableCell>{rowsPerPage * (page - 1) + index + 1}</TableCell>
                  <TableCell>{list[rowsPerPage * (page - 1) + index].owner}</TableCell>
                  <TableCell>{list[rowsPerPage * (page - 1) + index].balance}</TableCell>
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
