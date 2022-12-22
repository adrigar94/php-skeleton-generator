export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function capitalizeAndTrim(str: string): string {
    const words = str.split(' ');
    let result = "";
    for (let word of words) {
        result += capitalize(word);
    }
    return result;
}