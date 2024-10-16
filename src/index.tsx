import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    Context
} from "react";
import { Utils } from "./utils";

type Decorator<T, U, D> = undefined | ((state: T, decorators: D) => U);

type ReactiveState<T, U> = { state: T; decoratedState: U };

type ReactiveSubscription<T, U> = (data: ReactiveState<T, U>) => void;

export type ProviderProps<T, U, D> = {
    value?: T;
    decorator?: Decorator<T, U, D>;
    children?: JSX.Element | JSX.Element[];
};

export type ConsumerProps<T, U, D> = {
    children: (data: ReactiveState<T, U>) => JSX.Element | JSX.Element[];
} & D;

type ReactiveSubscriber<T, U, D> = {
    callback?: ReactiveSubscription<T, U>;
    decorators?: D;
};

export type ReactiveContext<T, U, D> = {
    //original Context class, use this with useContext hook
    default: Context<T>;
    //Component to render in the root of app
    Provider: (props: ProviderProps<T, U, D>) => JSX.Element;
    //Component that render children when Context changed
    Consumer: (props: ConsumerProps<T, U, D>) => JSX.Element;
    //name of context, used to identify it inside render tree
    displayName?: string;
    //function that update provider, is callable where you want in the code
    set: (state: Partial<T> | ((prevState: T) => Partial<T>)) => void;
    //function that return current context state, callable where you want
    get: (decorators?: D) => ReactiveState<T, U>;
    //function that allow to subscribe something to any context changes, return a callback to remove subscription
    subscribe: (
        callback: ReactiveSubscription<T, U>,
        decorators?: D
    ) => () => void;
    //delete all subscribers registered
    removeAllSubscribers: () => void;
    [key: string]: any;
};

let _decorator: any;

function _decorateState<T, U, D>(
    state: T,
    decorators?: D
): ReactiveState<T, U> {
    let decoratedState;
    if (typeof _decorator === "function") {
        decoratedState = _decorator(state, decorators);
    }
    return { decoratedState, state };
}

/**
 * generate a custom context that override React.Context
 * @param {*} defaultValue, must be an object
 */
function createReactiveContext<T, U, D>(
    defaultValue: T,
    defaultDecorator?: Decorator<T, U, D>
): ReactiveContext<T, U, D> {
    const Context = createContext(defaultValue);
    const _subscribers: {
        [key: string]: ReactiveSubscriber<T, U, D>;
    } = {};
    let _updater: (value?: Partial<T> | ((prevState: T) => Partial<T>)) => void;
    let _currentData: T;
    _decorator = defaultDecorator;

    /**
     * delete subscriber
     * @param {*} ids
     */
    function _clearSubscribers(ids: string[] = []) {
        for (let i = 0; i < ids.length; i++) {
            delete _subscribers[ids[i]];
        }
    }

    /**
     * @return array of undefined id to remove
     */
    function _callSubscribers(state: T): string[] {
        const idsToDelete: string[] = [];
        const ids = Object.keys(_subscribers);
        ids.forEach((id) => {
            const subscriber = _subscribers[id];
            if (subscriber && typeof subscriber.callback === "function") {
                subscriber.callback(
                    _decorateState(state, subscriber.decorators)
                );
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
    const Provider = function ({
        value: propValue,
        decorator: decoratorProp,
        ...rest
    }: ProviderProps<T, U, D>) {
        const [state, setState] = useState<T>(defaultValue);

        useEffect(() => {
            //store current state to a global scoped variable
            _currentData = state;
            //the state is chained, we need to call all subscribers
            _clearSubscribers(_callSubscribers(state));
            //reset updater with new state value
            _updater = (
                value: Partial<T> | ((prevState: T) => Partial<T>) = state
            ) => {
                let newState: T;
                if (typeof value === "function") {
                    newState = value(state) as unknown as T;
                } else if (typeof value === "object" && !Array.isArray(value)) {
                    newState = { ...state, ...value };
                } else {
                    newState = (value || state) as unknown as T;
                }
                if (!Utils.equals(newState as any, state as any)) {
                    setState(newState);
                }
            };
        }, [state]);

        useEffect(() => {
            //store decorator function each time changes
            //i don't trigger an update of each customer because usually _decorator function could be
            //an arrow function and will change eache time the parent of provider changes something in the state
            _decorator = decoratorProp;
        }, [decoratorProp]);

        useEffect(() => {
            //if prop value changes we need to update state
            _updater(propValue);
        }, [propValue]);

        return <Context.Provider value={state} {...rest} />;
    };
    function Consumer(props: ConsumerProps<T, U, D>) {
        const { children, ...decorators } = props;
        const state: T = useContext(Context);
        return (
            <React.Fragment>
                {children(_decorateState(state, decorators))}
            </React.Fragment>
        );
    }

    return {
        default: Context,
        ...Context,
        Provider,
        Consumer,
        set: (value) => {
            if (typeof _updater === "function") {
                _updater(value);
            }
        },
        get: (decorators?: D) => _decorateState(_currentData, decorators),
        subscribe: (callback: ReactiveSubscription<T, U>, decorators?: D) => {
            const id = `${Math.random().toString(36).substr(2, 9)}`;
            _subscribers[id] = { callback, decorators };
            //call callback when is registered
            if (typeof callback === "function") {
                callback(_decorateState(_currentData, decorators));
            }
            return () => {
                delete _subscribers[id];
            };
        },
        removeAllSubscribers: () => _clearSubscribers(Object.keys(_subscribers))
    };
}

function useReactiveContext<T, U, D>(
    context: ReactiveContext<T, U, D>,
    decorators?: D
): ReactiveState<T, U> {
    const _state = useContext(context.default);
    return _decorateState<T, U, D>(_state, decorators);
}

export { createReactiveContext, useReactiveContext };
