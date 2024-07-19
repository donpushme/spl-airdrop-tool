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
  PaginationPrevious
} from "@/components/ui/pagination"

export default function NftTble(props) {
  const { nfts } = props;
  return (
    <>
      {nfts.length && (
        <div className="w-3/4 mx-auto mt-4 p-4 border rounded">
          <Table>
            <TableCaption>NFT List</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mint</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nfts.map((nft, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{nft?.content?.metadata?.name}</TableCell>
                    <TableCell>{nft.id}</TableCell>
                    <TableCell>{nft?.ownership?.owner}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
