
export interface Pizza {
    id: number;
    name: string;
    origin: string;
    ingredients: Ingredient[];

}
export interface QueryPizzas {
    pizzas: Pizza[];
}

export interface QueryIngredientes {
    ingredientes: Ingredient[];
}

export interface Ingredient {
    id: number;
    name: string;
    calories: string;
}
