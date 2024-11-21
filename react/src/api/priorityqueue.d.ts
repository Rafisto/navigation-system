// Create a declaration file (e.g., `priorityqueuejs.d.ts` in your project)
declare module 'priorityqueuejs' {
    export default class PriorityQueue<T> {
        constructor(compare: (a: T, b: T) => number);
        push(item: T): void;
        pop(): T | undefined;
        isEmpty(): boolean;
    }
}
