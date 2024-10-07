import { useAppContext } from "@/contexts/AppContext"
import { useModalContext } from "@/contexts/ModalContext";
import { getToken, getTokenBalance, isValidSolanaAddress } from "@/lib/solana";
import { useCallback, useEffect, useState } from "react";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58"

export const useToken = () => {
    const { mint } = useAppContext();
    const { tempWallet } = useModalContext();
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (!isValidSolanaAddress(mint)) return
        fetchToken()
        if (tempWallet.length > 10) {
            console.log("fetching token");
            fetchBalance()
        }
        setIsLoading(true);
    }, [tempWallet, mint])

    const fetchToken = useCallback(async () => {
        const token = await getToken(mint);
        setToken(token);
        setIsLoading(false);
    }, [mint])

    const fetchBalance = useCallback(async () => {
        const secretKey = bs58.decode(tempWallet);
        const keyPair = Keypair.fromSecretKey(secretKey);
        const balance = await getTokenBalance(keyPair.publicKey.toBase58(), mint);
        console.log(balance)
        setToken({ ...token, balance })
    }, [mint, tempWallet])

    return { token, isLoading }
}