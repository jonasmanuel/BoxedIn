export function arrayToMap<T, V>(array: T[], keyExtractor: (el: T) => string, valueExtractor: (el: T) => V) {
    let result: { [key: string]: V } = {};
    array.reduce((prev, curr)=>{
        prev[keyExtractor(curr)] = valueExtractor(curr);
        return prev
    }, result);
    return result;
}