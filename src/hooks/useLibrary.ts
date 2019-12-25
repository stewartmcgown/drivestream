import { useGapi } from "./useGapi"
import { useEffect, useState } from "react";
import { getLibrary } from "../db/getLibrary";

export const useLibrary = (id: string) => {
    const [gapi] = useGapi();
    const [library, setLibrary] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLibrary = async () => {
            const response = await getLibrary({ gapi, id })

            setLibrary(response);
        }

        if (!loading && gapi) {
            setLoading(true);
            fetchLibrary();
        }
    })


    return [library, loading];
}