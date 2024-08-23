"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileIcon, UserListIcon } from "../Assests/icons/Icon";
import { Switch } from "../ui/switch";
import { useAppContext } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";

export default function NFTSnapCard({ params }) {
  const {
    showCollections,
    setShowCollections,
  } = params;
  const { mint, setMint } = useAppContext();
  const router = useRouter();

  const handleChange = (e) => {
    setMint(e.target.value)
  }

  return (
    <Card className="w-[95%] md:w-[700px] mx-auto mb-12 hover:border-green border-0">
      <CardHeader>
        <CardTitle className="text-center text-[50px]">NFT Snapshot</CardTitle>
        <CardDescription className="text-center">
          Take and export NFT holders snapshot anywhere anytime
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5 gap-2">
              <Input
                className="border-green p-4"
                id="name"
                placeholder="MCC collection / NFT address"
                value={mint}
                onChange={handleChange}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="show_collection">Show Collections</Label>
          <Switch
            id="show_collection"
            checked={showCollections}
            onCheckedChange={() => {
              setShowCollections((pre) => !pre);
            }}
          />
        </div>
        <div className="flex justify-start gap-4">
          <Button
            className="flex  gap-2"
            onClick={() => {
              router.push(`/snapshot/nft/hashlist/${mint}`);
            }}
          >
            <ProfileIcon />
            Hashlist
          </Button>

          <Button
            className="flex gap-2"
            onClick={() => {
              router.push(`/snapshot/nft/holderlist/${mint}`);
            }}
          >
            <UserListIcon />
            Holderlist
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
