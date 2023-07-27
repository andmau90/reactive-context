# react-reactive-context

[![NPM](https://img.shields.io/npm/v/react-reactive-context.svg)](https://www.npmjs.com/package/react-reactive-context) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

- [About](#about)
- [Installing](#installing)
- [Doc](#doc)
- [Usage](#usage)
- [License](#license)

## About <a name="about"></a>

The purpose of this module is increase the functionality of React.Context without add into the project a big library like redux.
This module work in the same way of base React.Context but adds the possibility to set a new value without update Context.Provider prop, also allows to read Context state where you want into the code, there is also the possibility to add subscribers called that will be called when an update of Context occurs.
Finally, the creator function or Context.Provider component accept a decorator that receives a current Context state and a set of attributes from each reader (hook, Consumer, subscriber) to customize the state for each of them.

### Installing <a name="installing"></a>

```bash
npm install --save react-reactive-context
```

## Doc <a name="doc"></a>

### ```createReactiveContext```
return a new Context, the function accepts two parameters

| name      | type | description                                                                       |
| --------- | ---- | --------------------------------------------------------------------------------- |
| state     | any  | default context value                                                             |
| decorator | func | when the state change take its value and return a new decorated state             |

### ```Context.Provider```
Provider accepts the following props
@see[Provider](https://legacy.reactjs.org/docs/context.html#contextprovider)
| name      | type | description                                                                                |
| --------- | ---- | ------------------------------------------------------------------------------------------ |
| value     | any  | context value                                                                              |
| decorator | func | when the state change take its value and return a new decorated state                      |

### ```Context.Consumer```
Consumer props are passed like decorators to decorator function
@see [Consumer](https://legacy.reactjs.org/docs/context.html#contextconsumer)

### ```useReactiveContext```
trigger component update if something changes, accepts two parameters
| name       | type             | description                                                                       |
| ---------- | ---------------- | --------------------------------------------------------------------------------- |
| Context    | ReactiveContext  | Context variable                                                                  |
| decorators | object           | passed to decorator function                                                      |


### ```subscribe```
accepts two parameters
| name       | type             | description                                                                       |
| ---------- | ---------------- | --------------------------------------------------------------------------------- |
| callback   | func             | return current decorated state                                                    |
| decorators | object           | passed to decorator function                                                      |

### ```set```
update a Context, accepts new state value

### ```get```
return current Context status everywhere, accepts a decorator object

### ```removeAllSubscribers```
remove all subscribtion registered by subscribe method

## Usage <a name="usage"></a>

### Import
```tsx
    import React, { useEffect, useState } from "react";
    import { createReactiveContext, useReactiveContext } from "react-reactive-context";
```

### Initialization
```tsx
    type MyContext = {
        color: string,
        supportColor?: string
    };

    type MyContextDecorated = {
        ...
    };

    type MyDecorators = {};

    //Context initialization, could be empty
    const Context = createReactiveContext<MyContext, MyContextDecorated, MyDecorators>({
        supportColor: "#AA0000"
    }, (state) => processedState);

    <Context.Provider value={state} decorator={(state) => processedState}>
        {children}
    </Context.Provider>
```

### Hook
```tsx
    //update component by custom hook
    const state = useReactiveContext(Context, { /* decorators returned inside decorator function */ });
```

### Consumer
```tsx
    <Context.Consumer /* all props except children are passed like decorators to decorator */>
        {(state) => null}
    </Context.Consumer>
```

### Subscriber
```tsx
   useEffect(() => {
        //listen to any Context change
        const subscription = Context.subscribe((processedState) => {
            
        }, {/* decorators returned inside decorator function */});

        return () => {
            //unsubscribe
            subscription();
        };
    }, []);
```

### Setter
```tsx
    Context.set(state);
```
or you could update Context.Provider value

### Getter
```tsx
    Context.get(/* decorators returned inside decorator function */);
```

## License  <a name="license"></a>

MIT © [andmau90](https://github.com/andmau90)
