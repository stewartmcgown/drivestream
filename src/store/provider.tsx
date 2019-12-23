import { createGlobalState } from 'react-hooks-global-state';
import { DefaultStore } from "./store";

const { GlobalStateProvider, useGlobalState } = createGlobalState(DefaultStore);

export const
    useStore = useGlobalState;
export const
    StoreProvider = GlobalStateProvider;
