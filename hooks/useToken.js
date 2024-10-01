import { useAppContext } from "@/contexts/AppContext"
import { getToken, isValidSolanaAddress } from "@/lib/solana";
import { useCallback, useEffect, useState } from "react";

export const useToken = () => {
    const { mint } = useAppContext();
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if(!isValidSolanaAddress(mint)) return
        setIsLoading(true);
        start()
    }, [mint]);

    const start = useCallback(async () => {
        const token = await getToken(mint);
        setToken(token);
        setIsLoading(false);
    }, [mint])

    return { token, isLoading }
}