import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useCallback, useState, useEffect } from "react";
import { Input } from "../ui/input";
import { ChevronsRight, ChevronRight, ChevronsLeft, ChevronLeft } from "lucide-react";

export function TablePagination(props) {
  const { page, pages, setPage } = props;
  const [inputPage, setInputPage] = useState(page);

  const changePage = useCallback(
    (n) => {
      setPage(n);
      setInputPage(n);
    },
    [setPage, setInputPage]
  );

  const prevPage = useCallback(() => {
    page == 1 ? changePage(1) : changePage(page - 1);
  }, [page, changePage]);

  const nextPage = useCallback(() => {
    page == pages ? changePage(pages) : changePage(page + 1);
  }, [page, pages, changePage]);


  return (
    <Pagination className="mt-4">
      <PaginationContent className="gap-2">
        <PaginationItem>
          <ChevronsLeft
            className="cursor-pointer"
            onClick={() => {
              changePage(1);
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <ChevronLeft className="cursor-pointer" onClick={prevPage} />
        </PaginationItem>
        <PaginationItem>
          <Input
            className="min-w-10 outline-0 w-20 text-center"
            value={inputPage}
            onChange={(e) => {
              setInputPage(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const value = Number(e.target.value);
                if (value < 1 || value > pages || isNaN(value)) return;
                setPage(Math.floor(value));
              }
            }}
          />
        </PaginationItem>
        <PaginationItem>
          <ChevronRight className="cursor-pointer" onClick={nextPage} />
        </PaginationItem>
        <PaginationItem>
          <ChevronsRight
            className="cursor-pointer"
            onClick={() => {
              changePage(pages);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
