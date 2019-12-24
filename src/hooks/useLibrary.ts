import { useGapi } from "./useGapi"
import { useEffect, useState } from "react";

export const useLibrary = (fileId: string) => {
    const [gapi] = useGapi();
    const [library, setLibrary] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLibrary = async () => {
            const response = await gapi.client.drive.files.get({
                fileId,
				fields: "nextPageToken,items(id,title,properties)",
            })

            setLibrary(response);

        }

        if (!loading && gapi) {
            setLoading(true);
            fetchLibrary();
        }
    })


    return [library, loading];
}