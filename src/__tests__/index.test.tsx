import renderer, { ReactTestRenderer } from "react-test-renderer";
import React from "react";
import { createReactiveContext } from "../index";
import { act } from "@testing-library/react";

type Ctx = {
    color?: string
};

test("reactive context empty", () => {
    expect(createReactiveContext({})).toBeDefined();
});

describe("Testing provider initialization", () => {
    it("init context", () => {
        const Context = createReactiveContext({color: "red"} as Ctx);
        expect(renderer
            .create(
                <Context.Provider>
                    <Context.Consumer>
                        {(style) => (
                            <div style={{ color: style.color }}>Test red</div>
                        )}
                    </Context.Consumer>
                </Context.Provider>)
            .toJSON()).toMatchSnapshot();
    })

    //we need to use act otherwise setState are not managed
    it("overriding context by provider state", async () => {
        let wrapper: ReactTestRenderer;
        const Context = createReactiveContext({ color: "blue" } as Ctx);
        await act(async () => {
            wrapper = renderer
                .create(
                    <Context.Provider value={{ color: "red" }}>
                        <Context.Consumer>
                            {(style) => (
                                <div style={{ color: style.color }}>Test red</div>
                            )}
                        </Context.Consumer>
                    </Context.Provider>
                );
        });
        await expect(wrapper!.toJSON()).toMatchSnapshot();
    });
})
