export namespace std {
    export const printf = (...args: any[]): void => {
        console.log(...args)
    }
}


let a:string = '1';
// 解除这段注释babel是可以正常编译的，但是tsc就会报错，因为类型错误
// a = 2;
export {a};