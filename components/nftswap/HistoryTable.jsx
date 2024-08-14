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
import { SquareArrowOutUpRightIcon, Trash } from "lucide-react";
import { deleteProposal } from "@/action";
import { useRouter } from "next/navigation";

const status = ["Pending", "Accepted", "Completed"];

export default function SendTable({ list }) {
  const router = useRouter();
  const delProposal = async (id) => {
    const res = await deleteProposal(id);
    if (res) router.refresh();
  };
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-8">No</TableHead>
          {/* <TableHead>NFT</TableHead> */}
          <TableHead>Send To</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Proposed At</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="text-center">{index + 1}</TableCell>
            <TableCell className="max-w-[100px] truncate">
              {item.userId2}
            </TableCell>
            <TableCell>{status[item.status]}</TableCell>
            <TableCell>{item.date}</TableCell>
            <TableCell>
              <Trash
                className="text-right hover:cursor-pointer"
                size={20}
                onClick={() => {
                  delProposal(item._id);
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
