let store = {
    "owner": "315437752093245441",
    "prefix": "-"
};

export function config() {

}

export function get(key: "client" | string, def?: any): any {
    return store[key] || def;    
}

export function set(key: string, value: any): void {
    store[key] = value;
}
