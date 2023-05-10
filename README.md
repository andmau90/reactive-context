# react-reactive-context

> extending react context functionalities

[![NPM](https://img.shields.io/npm/v/reactive-context.svg)](https://www.npmjs.com/package/react-reactive-context) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-reactive-context
```

## Doc

```createReactiveContext```
return a new Context

```useReactiveContext```
trigger component update if something changes

```Context.subscribe```
event emitted by Context if something changes

```Context.set```
update a Context by method

```Context.get```
return current Context status everywhere

```Context.Provider```
see React.Context Provider

```ColorContext.Consumer```
see React.Context Consumer

## Usage

```tsx
import React, { useEffect, useState } from "react";

import { createReactiveContext, useReactiveContext } from "react-reactive-context";

//Context initialization, could be empty
const ColorContext = createReactiveContext({
    supportColor: "#AA0000"
});

const TestHook = () => {
    //update component by custom hook
    const { supportColor } = useReactiveContext(ColorContext);

    return <div style={{ color: supportColor }}>{"Test hook"}</div>;
};

const TestConsumer = () => {
    //update component by Consumer
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
        //listen to any Context change
        const subscription = ColorContext.subscribe((contextState) => {
            console.debug(contextState);
        });

        return () => {
            //unsubscribe
            subscription();
        };
    }, []);

    //update context by set method
    const _setBlue = () => {
        ColorContext.set({
            supportColor: "blue"
        });
    };

    //update Context by Provider props
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
```

## License

MIT © [andmau90](https://github.com/andmau90)
