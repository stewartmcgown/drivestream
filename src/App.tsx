import React from 'react';
import { Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';


import logo from './logo.svg';
import './App.css';
import { SidebarContent } from './layouts/SidebarContent';
import { Dashboard } from './views/Dashboard';
import { routes } from './routes';
import { theme } from './theme';
import { ThemeProvider } from '@material-ui/core';
import { StoreProvider, useStore } from './store';
import { Config } from './config';


const App: React.FC = () => {

    const [auth, dispatch] = useStore('auth');

    // Register Loaders
    document.addEventListener('google.api.load', e => {
        const login = async () => {
            const CLIENT_ID = process.env.REACT_APP_CLIENT_ID;
            const SCOPES = 'https://www.googleapis.com/auth/drive';

            await gapi.client.init({
                apiKey: process.env.REACT_APP_API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v2/rest"],
                scope: SCOPES
              });

              await gapi.auth2.getAuthInstance().signIn()

            await gapi.client.load('drive', 'v2');

            console.log(await gapi.client.drive.files.list({
            q: `mimeType contains 'folder' and 'root' in parents and not trashed`,
			spaces: "drive",
			fields: "nextPageToken,items(id,title,properties)",
			pageSize: 1000
		}))
        }

        login()
    })

    return (
        
                <Container>
                    {routes.map((r, i) =>
                        <Route key={i} path={r.path} exact={r.exact} component={() =>
                            <r.layout>
                                <r.component />
                            </r.layout>
                        } />)}
                </Container>
           
    );
}

export default () => <StoreProvider>
                        <ThemeProvider theme={theme}>
                            <App />
                            </ThemeProvider>
        </StoreProvider>;
