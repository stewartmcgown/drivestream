import { useGapi } from "./useGapi"
import { useEffect, useState } from "react";
import { getLibrary } from "../db/getLibrary";
import { Library } from "../models/Library";
import { AsyncHookStatus } from "./asyncHook";

export interface UseLibraryHookStatus extends AsyncHookStatus {
    data: Library;
}

export const useLibrary = (id: string): [() => void, UseLibraryHookStatus] => {
    const [gapi, gapiReady] = useGapi();
    const [library, setLibrary] = useState();
    const [loading, setLoading] = useState(true);
    const [called, setCalled] = useState(false);

    useEffect(() => {
        const fetchLibrary = async () => {
            const response = await getLibrary({ id })
            console.log(response);
            setLibrary(response);
            setLoading(false);
        }

        if (called && gapiReady) {
            setLoading(true);
            fetchLibrary();
        }
    }, [gapiReady, called])

    return [() => { setCalled(true); }, { loading, called, data: library }];
}