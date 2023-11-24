import mongoose from "mongoose";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Pet } from "./type.ts";


// Connect to MongoDB
mongoose.connect("mongodb+srv://sergioom9:nebrija22@cluster0.9dzkoo1.mongodb.net/?retryWrites=true&w=majority");

// Define Mongoose model
const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  breed: { type: String, required: true },
});

const PetModel = mongoose.model("Pet", petSchema);

// The GraphQL schema
const typeDefs = `
  type Pet {
    id: ID!
    name: String!
    breed: String!
  }
  type Query {
    hello: String!
    pets: [Pet!]!
    pet(id: ID!): Pet!
  }
  type Mutation {
    addPet(name: String!, breed: String!): Pet!
    deletePet(id: ID!): Pet!
    updatePet(id: ID!, name: String!, breed: String!): Pet!
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => "world",
    pets: async () => {
      try {
        const pets = await PetModel.find();
        return pets;
      } catch (error) {
        console.error("Error fetching pets", error);
        throw error;
      }
    },
    pet: async (_, args: { id: string }) => {
      try {
        const pet = await PetModel.findById(args.id);
        if (!pet) {
          {
            extensions: { code: "NOT_FOUND" }
          };
        }
        return pet;
      } catch (error) {
        console.error(`Error fetching pet with id ${args.id}`, error);
        throw error;
      }
    },
  },
  Mutation: {
    addPet: async (_, args: { name: string; breed: string }) => {
      try {
        const pet = new PetModel({
          name: args.name,
          breed: args.breed,
        });
        await pet.save();
        return pet;
      } catch (error) {
        console.error("Error adding pet", error);
        throw error;
      }
    },
    deletePet: async (_, args: { id: string }) => {
      try {
        const pet = await PetModel.findByIdAndRemove(args.id);
        if (!pet) {
          {
            extensions: { code: "NOT_FOUND" }
          };
        }
        return pet;
      } catch (error) {
        console.error(`Error deleting pet with id ${args.id}`, error);
        throw error;
      }
    },
    updatePet: async (_, args: { id: string; name: string; breed: string }) => {
      try {
        const pet = await PetModel.findByIdAndUpdate(
          args.id,
          { name: args.name, breed: args.breed },
          { new: true }
        );
        if (!pet) {
          {
            extensions: { code: "NOT_FOUND" }
          };
        }
        return pet;
      } catch (error) {
        console.error(`Error updating pet with id ${args.id}`, error);
        throw error;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server);
console.log(`Server ready at ${url}`);
