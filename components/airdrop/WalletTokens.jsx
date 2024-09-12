
import { useWalletTokens } from "@/hooks/useWalletToken";

export default function WalletToken({ tokens }) {

    // const { tokens, loading, error } = useWalletTokens();
    console.log(tokens)
    return (
        <div className="absolute top-full bg-background w-[calc(100%-120px)] border rounded-sm p-2">
            <div className="scrollbar p-2">
                <div className="w-[370px]">
                    {tokens.map((token, index) => {
                        return (
                            <div className="flex gap-2 text-xs items-center" key={index}>
                                <div className="w-10/12">
                                    <div>{token.name}</div>
                                    <div className="text-gray-500">{token.mint}</div>
                                </div>
                                <div className="w-2/12 text-right">{`${token.amount} ${token.symbol}`}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}