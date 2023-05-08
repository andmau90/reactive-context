import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    Context
} from "react";
import { Consumer } from "react";

type ProviderProps<T> = {
    value?: T,
    children?: React.ReactNode | undefined
};

type ReactiveSubscriber<T> = (state: T) => void;

type ReactiveContext<T> = {
    //original Context class, use this with useContext hook
    default: Context<T>,
    //Component to render in the root of app
    Provider: (props: ProviderProps<T>) => JSX.Element,
    //Component that render children when Context changed
    Consumer: Consumer<T>,
    //name of context, used to identify it inside render tree
    displayName?: String,
    //function that update provider, is callable where you want in the code
    set: (state: T) => void,
    //function that return current context state, callable where you want
    get: () => T,
    //function that allow to subscribe something to any context changes, return a callback to remove subscription
    subscribe: (callback: ReactiveSubscriber<T>) => Function,
    //delete all subscribers registered
    removeAllSubscribers: () => void,
    [key: string]: any
};

/**
 * generate a custom context that override React.Context
 * @param {*} defaultValue, must be an object
 */
function createReactiveContext<T>(defaultValue: T): ReactiveContext<T> {
    const Context = createContext(defaultValue);
    let updater: (value: T) => void;
    let currentData: T;
    const subscribers: { [key: string]: ReactiveSubscriber<T> } = {};

    /**
     * delete subscriber
     * @param {*} ids
     */
    function clearSubscribers(ids: string[] = []) {
        for (let i = 0; i < ids.length; i++) {
            delete subscribers[ids[i]];
        }
    }

    /**
     * @return array of undefined id to remove
     */
    function callSubscribers(state: T): string[] {
        const idsToDelete: string[] = [];
        const ids = Object.keys(subscribers);
        ids.forEach((id) => {
            const subscriber = subscribers[id];
            if (typeof subscriber === "function") {
                subscriber(state);
            } else {
                idsToDelete.push(id);
            }
        });
        return idsToDelete;
    }

    /**
     * provider that expose a method to update state
     * @param {*} props
     * @returns
     */
    function Provider({
        value: propValue,
        ...rest
    }: ProviderProps<T>): JSX.Element {
        const [state, setState] = useState(defaultValue);

        useEffect(() => {
            currentData = state;
            clearSubscribers(callSubscribers(state));
            updater = (value: T) => {
                if (typeof value === "object" && !Array.isArray(value)) {
                    setState({ ...state, ...value });
                } else {
                    setState(value);
                }
            };
        }, [state]);

        useEffect(() => {
            if (propValue !== undefined) {
                setState(propValue);
            }
        }, [propValue]);

        return <Context.Provider value={state} {...rest} />;
    }

    return {
        default: Context,
        ...Context,
        Provider,
        set: (value: T) => {
            if (typeof updater === "function") {
                updater(value);
            }
        },
        get: () => currentData,
        subscribe: (callback) => {
            const id = `${Math.random().toString(36).substr(2, 9)}`;
            subscribers[id] = callback;
            return () => {
                delete subscribers[id];
            };
        },
        removeAllSubscribers: () => clearSubscribers(Object.keys(subscribers))
    };
}

function useReactiveContext<T>(context: ReactiveContext<T>) {
    return useContext(context.default);
}

export { createReactiveContext, useReactiveContext };
