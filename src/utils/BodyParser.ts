export const parseBody = (body: string): { [key: string]: any } => {
    const splitValues = body.split("&");
    return splitValues.reduce((acc, item) => {
        const [ key, value ] = item.split("=");
        return { ...acc, [key]: value };
    }, {})
}