# react-reactive-context

[![NPM](https://img.shields.io/npm/v/react-reactive-context.svg)](https://www.npmjs.com/package/react-reactive-context) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Table of Contents

- [About](#about)
- [Installing](#installing)
- [Doc](#doc)
- [Usage](#usage)
- [License](#license)

## About <a name="about"></a>

Write about 1-2 paragraphs describing the purpose of your project.

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
    //Context initialization, could be empty
    const ColorContext = createReactiveContext({
        supportColor: "#AA0000"
    }, (state) => processedState);

    <ColorContext.Provider value={state} decorator={(state) => processedState}>
        {children}
    </ColorContext.Provider>
```

### Hook
```tsx
    //update component by custom hook
    const state = useReactiveContext(ColorContext, { /* decorators returned inside decorator function */ });
```

### Consumer
```tsx
    <ColorContext.Consumer /* all props except children are passed like decorators to decorator */>
        {(state) => null}
    </ColorContext.Consumer>
```

### Subscriber
```tsx
   useEffect(() => {
        //listen to any Context change
        const subscription = ColorContext.subscribe((processedState) => {
            
        }, {/* decorators returned inside decorator function */});

        return () => {
            //unsubscribe
            subscription();
        };
    }, []);
```

### Setter
```tsx
    ColorContext.set(state);
```
or you could update Context.Provider value

### Getter
```tsx
    ColorContext.get(/* decorators returned inside decorator function */);
```

## License  <a name="license"></a>

MIT © [andmau90](https://github.com/andmau90)
