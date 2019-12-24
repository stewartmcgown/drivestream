import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import Container from '@material-ui/core/Container';


import logo from './logo.svg';
import './App.css';
import { SidebarContent } from './layouts/SidebarContent';
import { Dashboard } from './views/Dashboard';
import { routes } from './routes';
import { theme } from './theme';
import { ThemeProvider, CircularProgress } from '@material-ui/core';
import { StoreProvider, useStore } from './store';
import { Config } from './config';
import { sleep } from './utils/sleep';


const App: React.FC = () => {

    const [auth, setAuth] = useStore('auth');

    // Register Loaders

    return (
        
                <Container>
                    {routes.map((r, i) =>
                        <Route key={i} path={r.path} exact={r.exact} component={() =>
                            <r.layout>
                                <r.component />
                            </r.layout>
                        } />) } />
                    }
                </Container>
           
    );
}

export default () => <StoreProvider>
                        <ThemeProvider theme={theme}>
                            <App />
                            </ThemeProvider>
        </StoreProvider>;
