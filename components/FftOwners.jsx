import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function NftOwners(props) {
  const { owners } = props;

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
            {owners?.map((owner, key) => {
              return (
                <TableRow key={key}>
                  <TableCell className="h-8 p-1">{key + 1}</TableCell>
                  {properties.map((item, key) => {
                    return (
                      <TableCell className="h-8 p-1" key={key}>
                        {owner[item]}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  } else return <></>;
}
