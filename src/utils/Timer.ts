export const timer = (ms: number) => {
    return new Promise((resolve) => { setTimeout(resolve, ms) });
}