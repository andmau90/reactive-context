export namespace Utils {
    function hasProperty(obj = {}, property = "") {
        return Object.prototype.hasOwnProperty.call(obj, property);
    }

    export function areEqualShallow(
        a: { [key: string]: any } = {},
        b: { [key: string]: any } = {}
    ): boolean {
        const aDifferentFromB = Object.keys(a).find((key) => {
            if (typeof a[key] === "function" || typeof a[key] === "object") {
                return false;
            }
            if (!hasProperty(b, key)) {
                return true;
            }
            return a[key] !== b[key];
        });
        const bDifferentFromA = Object.keys(b).find((key) => {
            if (typeof b[key] === "function" || typeof b[key] === "object") {
                return false;
            }
            return !hasProperty(a, key);
        });
        return !aDifferentFromB && !bDifferentFromA;
    }
}
