import { useEffect, useState } from "react"
import { sleep } from "../utils/sleep";

export const useGapi = (): [typeof gapi, boolean] => {
    const [_gapi, setGapi] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const login = async () => {

            while(!window?.gapi?.client) { console.log('still no gapi'); await sleep(100); }

            const gapi = window['gapi'];

            const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
            const SCOPES = 'https://www.googleapis.com/auth/drive';

            await (gapi.client as any).init({
                apiKey: process.env.REACT_APP_API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v2internal/rest"],
                scope: SCOPES
              });


            await gapi.client.load('drive', 'v3');

            setGapi(gapi);
            setLoading(false);
        }

        login();
    }, [])

    return [_gapi, loading];
}