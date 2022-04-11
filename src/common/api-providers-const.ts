class ApiProvider {
    public id!: number;
    public value!: string;
    public filter: string;

    constructor(data: { id: number, value: string, filter?: string }) {
        this.id = data.id;
        this.value = data.value;
        this.filter = data.filter;
    }
}

interface IProviderConst {
    [key: string]: ApiProvider;
};

export const apiProvidersConst: IProviderConst = {
    weather: new ApiProvider({
        id: 1,
        value: 'weather'
    }),
    airPollution: new ApiProvider({
        id: 2,
        value: 'air pollution'
    }),
    bta: new ApiProvider({
        id: 3,
        value: 'BTA',
        filter: 'bta'
    }),
    cnn: new ApiProvider({
        id: 4,
        value: 'CNN',
        filter: 'cnn'
    }),
    nyt: new ApiProvider({
        id: 5,
        value: 'New York Times',
        filter: 'nyt'
    }),
    bbc: new ApiProvider({
        id: 6,
        value: 'BBC',
        filter: 'bbc'
    }),
    reuters: new ApiProvider({
        id: 7,
        value: 'Reuters',
        filter: 'reuters'
    }),
    guardian: new ApiProvider({
        id: 8,
        value: 'The Guardian',
        filter: 'guardian'
    }),
    verge: new ApiProvider({
        id: 9,
        value: 'The Verge'
    }),
    techCrunch: new ApiProvider({
        id: 10,
        value: 'TechCrunch'
    }),
    techRadar: new ApiProvider({
        id: 11,
        value: 'TechRadar'
    }),
    engadget: new ApiProvider({
        id: 12,
        value: 'Engadget'
    })
};
