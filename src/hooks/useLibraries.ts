import { useGapi } from "./useGapi"
import { useEffect, useState } from "react";
import { Library } from "../models/Library";
import { sleep } from "../utils/sleep";
import { AsyncHookStatus } from "./asyncHook";

export const useLibraries = (): [() => void, AsyncHookStatus] => {
    const [gapi, gapiReady] = useGapi();
    const [libraries, setLibraries] = useState();
    const [loading, setLoading] = useState(false);
    const [called, setCalled] = useState(false);
    const [_trigger, _setTrigger] = useState(false);

    useEffect(() => {
        const fetchLibraries = async () => {
            setLoading(true);
            const { result: { files } } = await gapi.client.drive.files.list({
                q: `properties has { key='drivestream' and value='library' } and trashed = false`,
                fields: "nextPageToken,files(id,name,properties)",
                pageSize: 1000
            })

            setLibraries(files);
            setLoading(false);
            _setTrigger(false);
        }

        if (!loading && _trigger && gapiReady)
            fetchLibraries()
    }, [_trigger, gapiReady]);


    return [() => { setCalled(true); _setTrigger(true) }, { data: libraries, loading, called }];
}