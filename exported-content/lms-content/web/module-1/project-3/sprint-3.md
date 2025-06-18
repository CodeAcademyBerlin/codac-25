---
title: Sprint 3
---


## Epic 1: Integrate a global store (Context) to manage your data

Before starting to talk about State management, it is important for you to get familiar with one of the most common architecture patterns: the Model-View-Controller or MVC.\
This pattern describes a separation between data (the Model), interface (the View) and application logic (the Controller). Each of these components are built to handle specific development aspects of an application.\
As an application scales, the MVC data flow can become problematic because MVC applications have data that can move in multiple directions and the code is difficult to maintain.

Facebook solved this problem by creating the Flux Architecture, a design pattern that only allows data to flow in one direction while working closely with React to only update a web page when the state of a component changes.\
Redux is a library that acts as a container and helps to manage your application data flow. It is similar to Flux, but it expands on it by making it suitable for more complex architecture.\
Context API with React Hooks is the newest feature of React and combines the best of Redux and Flux, making state management a lot easier.

State management refers to the management of data across an app or a website and it is a way to store information about the behavior of your app.

[Here](https://react.dev/learn/managing-state) is some information about state from the React docs.

[Prop drilling problem](https://kentcdodds.com/blog/prop-drilling)

In React there are several ways of dealing with this, using external libraries, but with since React v16 (2018), React provided us their own way of dealing with the situation described above. In this course we will focus in React's _Context API_:

* [Context](https://kentcdodds.com/blog/application-state-management-with-react)
* [Context official docs](https://reactjs.org/docs/context.html)

The rule of thumb is to keep your states as close as possible to where they are needed. However, in the case of your app, you should consider whether there is any kind of data that you would need in more than one component which are not related to each other (without a parent-child relation). If that data needs to be fetched, then you could move your fetch functions here in order to access the data from more than one component.
