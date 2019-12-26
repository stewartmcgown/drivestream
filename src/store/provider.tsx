import { createGlobalState, createStore } from 'react-hooks-global-state';
import { DefaultStore } from "./store";
import { Reducer } from './reducer';

const store = createStore(Reducer, DefaultStore);

export const
    useStore = store.useGlobalState;
export const
    StoreProvider = store.GlobalStateProvider;
export const { dispatch } = store;
