import { AsyncHookStatus } from "./asyncHook";
import { useGapi } from "./useGapi";
import { useState, useEffect } from "react";
import { useLibrary } from "./useLibrary";
import { scanLibrary, ScanLibraryDelta } from "../db/scanLibrary";
import { dispatch } from "../store";

/**
 * Fetches all the movie files in the given library
 */
export const useScanLibrary = ({ id }): [() => void, AsyncHookStatus] => {
    const [gapi, gapiReady] = useGapi();
    const [loading, setLoading] = useState(false);
    const [called, setCalled] = useState(false);
    const [_trigger, _setTrigger] = useState(false);

    useEffect(() => {
        const update = (delta: ScanLibraryDelta) => {
            dispatch({ type: 'updateSnackbar', payload: { message: `Found ${delta.totalFiles} files...` }});

            if (delta.done)
                dispatch({ type: 'closeSnackbar' })
        }

        const doScan = async () => {
            scanLibrary({ id, update });
        }

        if (!loading && _trigger && gapiReady)
            doScan()

    }, [_trigger, gapiReady]);


    return [() => { setCalled(true); _setTrigger(true) }, { data: {}, loading, called }];
}