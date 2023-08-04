export namespace Utils {
    function hasProperty(obj = {}, property = "") {
        return Object.prototype.hasOwnProperty.call(obj, property);
    }

    export function equals(
        a: { [key: string]: any } = {},
        b: { [key: string]: any } = {}
    ): boolean {
        const aDifferentFromB = Object.keys(a).find((key) => {
            if (!hasProperty(b, key)) {
                return true;
            }
            if (
                typeof a[key] === "object" &&
                a[key] !== undefined &&
                a[key] !== null
            ) {
                return !equals(a[key], b[key]);
            }
            return a[key] !== b[key];
        });
        const bDifferentFromA = Object.keys(b).find((key) => {
            return !hasProperty(a, key);
        });
        return !aDifferentFromB && !bDifferentFromA;
    }
}
