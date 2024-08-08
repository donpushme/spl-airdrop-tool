import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { SquareArrowOutUpRightIcon } from "lucide-react";

const status = ["Pending", "Accepted", "Completed"];

export default function ReceiveTable({ list }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-8">No</TableHead>
          {/* <TableHead>NFT</TableHead> */}
          <TableHead>From</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Proposed At</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((item, index) => (
          <TableRow key={index} className="hover:cursor-pointer">
            <TableCell className="text-center">{index + 1}</TableCell>
            <TableCell className="max-w-[100px] truncate">
              {item.userId1}
            </TableCell>
            <TableCell>{status[item.status]}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              {item.status != 2 && <Link href={`/nft-swap/${item._id}`}>
                <SquareArrowOutUpRightIcon className="text-right" size={20} />
              </Link>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
