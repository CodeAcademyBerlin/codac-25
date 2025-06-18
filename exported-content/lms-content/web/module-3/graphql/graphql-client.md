---
title: GraphQl Client
---


GraphQL is a query language where you define a schema for your data, then tell GraphQL how to fetch and supply that schema.
We will learn the fundamental concepts of GraphQL by interacting with the public space X API and focus on writing a React app that uses GraphQL to render this data.

## GraphQL Explorer

Most of the time, implementation of a GraphQL app comes with setting up an interface called Explorer to easily visualise all the queries a backend implementation could provide.
Find below the explorer for the api to query SpaceX data.

[Graph QL API](https://api.spacex.land/graphql/)

## Apollo

Apollo is the most popular GraphQL implementation tool, it simplifies app development. It has libraries for many different languages and frameworks.
Here, we will use the library dedicated to React Client : `@apollo/client` as well as the `graphql` library. We can install both together by running: `npm i @apollo/client graphql`.

[Apollo React Documentation](https://www.apollographql.com/docs/react)

## Setting up the provider

The library works using React Hooks, similar to a Context that can distribute GraphQL capabilities to all of our application.
We start by setting up the configuration and wrap or provider around the App.

```js
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import { LaunchList } from "./components/LaunchList";

const client = new ApolloClient({
  uri: "https://api.spacex.land/graphql",
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h2>My first Apollo app 🚀</h2>
        <LaunchList />
      </div>
    </ApolloProvider>
  );
}

export default App;
```

## GraphQl components

```js
import React from "react";
import { useQuery, gql } from "@apollo/client";

export const LaunchList = () => {
  const { loading, error, data } = useQuery(gql`
    {
      launchesPast(limit: 10) {
        mission_name
        launch_date_local
        launch_site {
          site_name_long
        }
      }
    }
  `);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;
  console.log(data);
  return data.launchesPast.map(({ mission_name }) => (
    <div key={mission_name}>
      <p>{mission_name}</p>
    </div>
  ));
};
```
