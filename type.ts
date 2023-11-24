
export interface Pet {
    id: string;
    name: string;
    breed: string;
  }
  
  export interface Query {
    hello: string;
    pets: Pet[];
    pet: Pet;
  }
  
  export interface Mutation {
    addPet: Pet;
    deletePet: Pet;
    updatePet: Pet;
  }
  