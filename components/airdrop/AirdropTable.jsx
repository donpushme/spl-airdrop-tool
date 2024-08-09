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
import { Copy, Check } from "lucide-react";
import CopyButton from "./CopyButton";

const initialArray = new Array(100).fill(1);

export default function AirdropTable(props) {
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(1000);
  const [rowArray, setRowArray] = useState(initialArray);
  const { list } = props;
  const [copied, setCopied] = useState(false);

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

  const copyContent = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch (error) {
      console.log(error);
    }
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  if (list?.length) {
    const properties = Object.keys(list[0]);
    return (
      <div className="w-[900px] overflow-auto mx-auto mt-4 border rounded backdrop-blur-lg">
        <Table>
          <TableCaption>Token Owner List</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              {properties.map((property, key) => {
                return <TableHead key={key}>{property}</TableHead>;
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rowArray?.map((item, index) => {
              if (typeof list[rowsPerPage * (page - 1) + index] == "undefined")
                return;
              return (
                <TableRow key={index}>
                  <TableCell className="max-w-[50px]">
                    {rowsPerPage * (page - 1) + index + 1}
                  </TableCell>
                  {properties.map((property, key) => {
                    return (
                      <TableCell className="max-w-[50px]" key={key}>
                        <div className="flex">
                          <div className="truncate">
                            {list[rowsPerPage * (page - 1) + index][property]}
                          </div>
                          <div>
                            {(property === "owner" || property === "tx") && (
                              <CopyButton
                                value={
                                  list[rowsPerPage * (page - 1) + index][
                                    property
                                  ]
                                }
                              />
                            )}
                          </div>
                        </div>
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
