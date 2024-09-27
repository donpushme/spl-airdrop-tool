import { useAppContext } from "@/contexts/AppContext"
import { getSplTokenList } from "@/lib/solana";
import { useCallback, useEffect, useState } from "react";

export const useToken = () => {
    const { mint } = useAppContext();
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true);
        start()
    }, [mint]);

    const start = useCallback(async () => {
        const allSpl = await getSplTokenList();
        const token = allSpl.find((token) => { return token.address == mint });
        setToken(token);
        setIsLoading(false);
    }, [mint])

    return { token, isLoading }
}