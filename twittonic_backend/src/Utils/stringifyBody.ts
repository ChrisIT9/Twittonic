export const stringifyBody = (obj: { [key: string]: any }) => {
    return Object.entries(obj).reduce((acc, [key, value], index) => { 
        return (!index ? `${key}=${value}` : `${acc}&${key}=${value}`);
    }, "");
}