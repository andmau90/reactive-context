import isEqual from "lodash.isequal";

export namespace Utils {
    export function equals(
        a: { [key: string]: any },
        b: { [key: string]: any }
    ): boolean {
        return isEqual(a, b);
    }
}
