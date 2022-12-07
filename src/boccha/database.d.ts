type BoccCountResult = {
    total: number,
    [id: number]: {
        id: number,
        count: number,
        name: string,
        rarity: number
    }
};