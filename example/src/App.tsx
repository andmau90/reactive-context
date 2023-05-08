import React, { useEffect, useState } from "react";

import { createReactiveContext, useReactiveContext } from "reactive-context";

const ColorContext = createReactiveContext({
    supportColor: "#AA0000"
});

const TestHook = () => {
    const { supportColor } = useReactiveContext(ColorContext);

    return <div style={{ color: supportColor }}>{"Test hook"}</div>;
};

const TestConsumer = () => {
    return (
        <ColorContext.Consumer>
            {({ supportColor }) => (
                <div style={{ color: supportColor }}>{"Test consumer"}</div>
            )}
        </ColorContext.Consumer>
    );
};

const App = () => {
    const [state, setState] = useState({ supportColor: "#AA0000" });

    useEffect(() => {
        const subscription = ColorContext.subscribe((contextState) => {
            console.debug(contextState);
        });

        return () => {
            subscription();
        };
    }, []);

    const _setBlue = () => {
        ColorContext.set({
            supportColor: "blue"
        });
    };

    const _setGreen = () => {
        setState({
            supportColor: "green"
        });
    };

    return (
        <ColorContext.Provider value={state}>
            <input type="button" onClick={_setBlue} value="Blue" />
            <input type="button" onClick={_setGreen} value="Green" />
            <TestHook />
            <TestConsumer />
        </ColorContext.Provider>
    );
};

export default App;
