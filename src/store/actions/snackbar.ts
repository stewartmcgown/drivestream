import { Action, ActionFunction } from "../reducer";
import { Store } from "../store";

export const updateSnackbar: ActionFunction = (state: Store, { message }: { message: string; }) => {
    return {
        snackbar: {
            open: true,
            message,
        }
    }
}

export const closeSnackbar: ActionFunction = (state: Store, payload?: any) => {
    return {
        snackbar: {
            open: false,
        }
    }
}