import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const status=['Pending', 'Accepted', 'Completed']

export default function SwapListTable({list}) {
  console.log(list)
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center w-8">No</TableHead>
          {/* <TableHead>NFT</TableHead> */}
          <TableHead>Send To</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="text-center">{index + 1}</TableCell>
            <TableCell className="max-w-[100px] truncate">{item.userId2}</TableCell>
            <TableCell>{status[item.status]}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
