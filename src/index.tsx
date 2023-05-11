import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    Context
} from "react";

type ReactiveDecorator = { [key: string]: any };

type Decorator<T> =
    | undefined
    | ((state: T, decorators: ReactiveDecorator) => any);

type ReactiveSubscription<T> = (state: T) => void;

type ProviderProps<T> = {
    value?: T,
    decorator?: Decorator<T>,
    children?: React.ReactNode | undefined
};

type ConsumerProps<T> = {
    children: (state: T) => JSX.Element
} & ReactiveDecorator;

type ReactiveSubscriber<T> = {
    callback?: ReactiveSubscription<T>,
    decorators?: ReactiveDecorator
};

type ReactiveContext<T> = {
    //original Context class, use this with useContext hook
    default: Context<T>,
    //Component to render in the root of app
    Provider: (props: ProviderProps<T>) => JSX.Element,
    //Component that render children when Context changed
    Consumer: (props: ConsumerProps<T>) => JSX.Element,
    //name of context, used to identify it inside render tree
    displayName?: String,
    //function that update provider, is callable where you want in the code
    set: (state: T) => void,
    //function that return current context state, callable where you want
    get: (decorators: ReactiveDecorator) => T,
    //function that allow to subscribe something to any context changes, return a callback to remove subscription
    subscribe: (
        callback: ReactiveSubscription<T>,
        decorators?: ReactiveDecorator
    ) => () => void,
    //delete all subscribers registered
    removeAllSubscribers: () => void,
    [key: string]: any
};

let _decorator: Decorator<any>;

function _decorateState<T>(state: T, decorators: ReactiveDecorator = {}) {
    return typeof _decorator === "function"
        ? _decorator(state, decorators) || state
        : state;
}

/**
 * generate a custom context that override React.Context
 * @param {*} defaultValue, must be an object
 */
function createReactiveContext<T>(
    defaultValue: T,
    defaultDecorator?: Decorator<T>
): ReactiveContext<T> {
    const Context = createContext(defaultValue);
    const _subscribers: {
        [key: string]: ReactiveSubscriber<T>
    } = {};
    let _updater: (value?: T) => void;
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
    function Provider({
        value: propValue,
        decorator: decoratorProp,
        ...rest
    }: ProviderProps<T>): JSX.Element {
        const [state, setState] = useState(defaultValue);

        useEffect(() => {
            //store current state to a global scoped variable
            _currentData = state;
            //the state is chaned, we need to call all subscribers
            _clearSubscribers(_callSubscribers(state));
            //reset updater with new state value
            _updater = (value: T = state) => {
                if (typeof value === "object" && !Array.isArray(value)) {
                    setState({ ...state, ...value });
                } else {
                    setState(value || state);
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
    }

    function Consumer(props: ConsumerProps<T>): JSX.Element {
        const { children, ...decorators } = props;
        const state = useContext(Context);
        const _state = _decorateState(state, decorators);
        return children(_state);
    }

    return {
        default: Context,
        ...Context,
        Provider,
        Consumer,
        set: (value: T) => {
            if (typeof _updater === "function") {
                _updater(value);
            }
        },
        get: (decorators: ReactiveDecorator) =>
            _decorateState(_currentData, decorators),
        subscribe: (
            callback: ReactiveSubscription<T>,
            decorators?: ReactiveDecorator
        ) => {
            const id = `${Math.random().toString(36).substr(2, 9)}`;
            _subscribers[id] = { callback, decorators };
            return () => {
                delete _subscribers[id];
            };
        },
        removeAllSubscribers: () => _clearSubscribers(Object.keys(_subscribers))
    };
}

function useReactiveContext<T>(
    context: ReactiveContext<T>,
    decorators?: ReactiveDecorator
) {
    const _state = useContext(context.default);
    return _decorateState(_state, decorators);
}

export { createReactiveContext, useReactiveContext };
