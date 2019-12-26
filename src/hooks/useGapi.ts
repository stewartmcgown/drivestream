import { useEffect, useState } from "react"
import { sleep } from "../utils/sleep";

export const useGapi = (): [typeof gapi, boolean] => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const login = async () => {
            setReady(false);

            while(!window?.gapi?.client) { console.log('[useGapi] still no gapi'); await sleep(100); }

            console.log('[useGapi] gapi loaded')

            const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
            const SCOPES = 'https://www.googleapis.com/auth/drive';

            await (window.gapi.client as any).init({
                apiKey: process.env.REACT_APP_API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
                scope: SCOPES
              });

              console.log('[useGapi] gapi inited')


            await window.gapi.client.load('drive', 'v3');

            console.log('[useGapi] gapi client loaded')

            setReady(true);
        }

        if (!ready)
            login();
    })

    return [window.gapi, ready];
}