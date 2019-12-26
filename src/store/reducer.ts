import { Store } from "./store";
import * as actions from './actions';
import { mergeDeep } from "../utils/mergeDeep";
import { DeepPartial } from "../utils/types/DeepPartial";

export interface Action {
    type: keyof typeof actions;

    payload?: any;
}

export type ActionFunction = (state: Store, payload?: any) => DeepPartial<Store>;

export const Reducer = (state: Store, action: Action): Store => {
    if (actions[action.type] instanceof Function)
        return mergeDeep({}, state, actions[action.type](state, action.payload))

    return mergeDeep({}, state, action.payload);
}