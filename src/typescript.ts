export namespace std {
    export const printf = (...args: any[]): void => {
        console.log(...args)
    }
}


let a:string = '1';
a = 2;
export {a};