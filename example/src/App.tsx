import React, { useCallback, useEffect, useState } from "react";

import {
    createReactiveContext,
    useReactiveContext
} from "react-reactive-context";

const ColorContext = createReactiveContext({
    supportColor: "#AA0000"
});

const TestHook = () => {
    const { supportColor } = useReactiveContext(ColorContext, {
        name: "Hook"
    });
    return <div style={{ color: supportColor }}>{"Test hook"}</div>;
};

const TestConsumer = () => {
    return (
        <ColorContext.Consumer name="Consumer">
            {({ supportColor }) => {
                return (
                    <div style={{ color: supportColor }}>{"Test consumer"}</div>
                );
            }}
        </ColorContext.Consumer>
    );
};

const App = () => {
    const [state, setState] = useState({ supportColor: "#AA0000" });

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
            supportColor: "blue"
        });
    };

    const _setRed = () => {
        setState({
            supportColor: "red"
        });
    };

    const _setGreen = () => {
        setState({
            supportColor: "green"
        });
    };

    const _elaborator = useCallback((providerState: any, attributes: any) => {
        console.debug(
            "provider elaborator receive" + providerState.supportColor
        );
        let color;
        if (providerState.supportColor === "blue") {
            color = { supportColor: "#00AAAA" };
        } else if (providerState.supportColor === "green") {
            color = { supportColor: "green" };
        } else {
            color = { supportColor: "#AAaA00" };
        }
        console.debug(
            "provider elaborator return " +
                color.supportColor +
                ` for ${attributes.name}`
        );
        return color;
    }, []);

    return (
        <ColorContext.Provider value={state} elaborator={_elaborator}>
            <input type="button" onClick={() => _setBlue()} value="Blue" />
            <input type="button" onClick={() => _setGreen()} value="Green" />
            <input type="button" onClick={() => _setRed()} value="Red" />
            <TestHook />
            <TestConsumer />
        </ColorContext.Provider>
    );
};

export default App;
