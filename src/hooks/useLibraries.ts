import { useGapi } from "./useGapi"
import { useEffect, useState } from "react";
import { Library } from "../models/Library";

export const useLibraries = (): [Library[], boolean] => {
    const [gapi] = useGapi();
    const [libraries, setLibraries] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLibraries = async () => {
            const { result: { items }} = await gapi.client.drive.files.list({
				q: `properties has { key='drivestream' and value='library' and visibility='PUBLIC' } and trashed = false`,
				spaces: "drive",
				fields: "nextPageToken,items(id,title,properties)",
				pageSize: 1000
            })

            setLibraries(items);

        }

        if (!loading && gapi) {
            setLoading(true);
            fetchLibraries();
        }
    })


    return [libraries, loading];
}