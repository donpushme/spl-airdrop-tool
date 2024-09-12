import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { fetchWalletTokens } from "@/lib/solana";

export const useWalletTokens = () => {
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const wallet = useWallet();

    useEffect(() => {
        const start = async () => {
            if (!wallet || !wallet.publicKey) return; // Make sure the wallet is connected
            setLoading(true);
            setError(null);

            try {
                const res = await fetchWalletTokens(wallet.publicKey);
                setTokens(res);
            } catch (e) {
                setError("Failed to fetch tokens");
            } finally {
                setLoading(false);
            }
        };

        start();
    }, [wallet.publicKey]); // Listen to wallet.publicKey, not the whole wallet object

    return { tokens, loading, error };
};
