import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function NftTble(props) {
  const { nfts } = props;
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
            {nfts?.map((nft, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{nft}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  } else return <></>;
}
