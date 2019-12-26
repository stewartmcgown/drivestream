import { createGlobalState, createStore } from 'react-hooks-global-state';
import { DefaultStore } from "./store";
import { Reducer } from './reducer';

const { GlobalStateProvider, dispatch, useGlobalState } = createStore(Reducer, DefaultStore);

export const
    useStore = useGlobalState;
export const
    StoreProvider = GlobalStateProvider;
