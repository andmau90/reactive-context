import React, { useCallback, useEffect, useState } from "react";

import {
    createReactiveContext,
    useReactiveContext
} from "react-reactive-context";

type MyContext = {
    color?: string,
    supportColor?: string
};

const ColorContext = createReactiveContext({} as MyContext);

const TestHook = () => {
    const style = useReactiveContext(ColorContext, {
        height: 50,
        background: "green"
    });
    return <div style={style}>{"Test hook"}</div>;
};

const TestConsumer = () => {
    return (
        <ColorContext.Consumer name="Consumer" height={200} background={"blue"}>
            {(style) => {
                return <div style={style}>{"Test consumer"}</div>;
            }}
        </ColorContext.Consumer>
    );
};

const App = () => {
    const [state, setState] = useState({ color: "#AA0000" });

    useEffect(() => {
        const subscription = ColorContext.subscribe(
            (contextState) => {
                console.debug("Subscription");
                console.debug(contextState);
            },
            { name: "pippo" }
        );

        return () => {
            subscription();
        };
    }, []);

    const _setBlue = () => {
        ColorContext.set({
            color: "blue"
        });
    };

    const _setRed = () => {
        setState({
            color: "red"
        });
    };

    const _setGreen = () => {
        setState({
            color: "green"
        });
    };

    const _decorator = useCallback(
        (providerState: any, attributes: any) => ({
            ...providerState,
            ...attributes
        }),
        []
    );

    return (
        <ColorContext.Provider value={state} decorator={_decorator}>
            <input type="button" onClick={() => _setBlue()} value="Blue" />
            <input type="button" onClick={() => _setGreen()} value="Green" />
            <input type="button" onClick={() => _setRed()} value="Red" />
            <TestHook />
            <TestConsumer />
        </ColorContext.Provider>
    );
};

export default App;
