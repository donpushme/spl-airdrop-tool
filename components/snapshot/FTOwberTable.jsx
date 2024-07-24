import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FTOwnerTable(props) {
  const { owners } = props;
  console.log(owners)

  if (owners?.length) {
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
            {owners?.map((nft, index) => {
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
    );
  } else return <></>;
}
