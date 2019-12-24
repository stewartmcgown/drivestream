import { useEffect, useState } from "react"
import { sleep } from "../utils/sleep";

export const useGapi = () => {
    const [gapi, setGapi] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const login = async () => {

            while(!window['gapi']) { console.log('still no gapi'); await sleep(100); }

            const gapi = window['gapi'];

            const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
            const SCOPES = 'https://www.googleapis.com/auth/drive';

            await gapi.client.init({
                apiKey: process.env.REACT_APP_API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v2/rest"],
                scope: SCOPES
              });


            await gapi.client.load('drive', 'v2');

            setGapi(gapi);
        }

        if (!loading) {
            setLoading(true);
            login();
        }
    })

    return [gapi, loading];
}