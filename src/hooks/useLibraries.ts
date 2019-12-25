import { useGapi } from "./useGapi"
import { useEffect, useState } from "react";
import { Library } from "../models/Library";

export const useLibraries = (): [Library[], boolean] => {
    const [gapi] = useGapi();
    const [libraries, setLibraries] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLibraries = async () => {
            const { result: { files }} = await gapi.client.drive.files.list({
                q: `properties has { key='drivestream' and value='library' } and trashed = false`,
				fields: "nextPageToken,files(id,name,properties)",
				pageSize: 1000
            })

            setLibraries(files);

        }

        if (!loading && gapi) {
            setLoading(true);
            fetchLibraries();
        }
    })


    return [libraries, loading];
}