let store = {};

export function config() {

}

export function get(key: "client" | string, def?: any): any {
    return store[key] || def;    
}

export function set(key: string, value: any): void {
    store[key] = value;
}
