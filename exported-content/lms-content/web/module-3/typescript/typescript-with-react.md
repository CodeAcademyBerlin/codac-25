---
title: TypeScript with React
---


## Create TS React app

We can use the same boilerplate starter command previously used and add the template option `--template typescript` to generate a project with the tsconfig.json already configured.

```cmd
npx create-react-app my-app --template typescript
```

If using Vite, select Typescript when prompted.

## Functional components

Let's create a new functional component. For instance, one called "Profile.tsx". It will render information about a user. We will name the file extension '.tsx" to specify that it's a react typescript file.

```ts
import React from "react";

const Profile: React.FC = () => {
  return <div></div>;
};
export default Profile;
```

Here we assign our component to FC for "functional component". The type is imported from the React type definition library, we don't need to define anything ourselves.

## Passing props

The typed component will throw an error for anything that's not a valid prop and autocomplete everything else by default. The only known react prop is `children`, but we can define the shape of our own props using a typescript interface.
Let's now improve our components to receive props about a user. In order to make sure that our components receive the correct props, we will explicitly type an interface with the different properties of the user.

```ts
import React from "react";

interface Props {
  firstName: string;
  lastName: string;
}

const Profile: React.FC<Props> = ({ firstName, lastName }) => {
  return (
    <div>
      <h6>{firstName}</h6>
    </div>
  );
};

export default Profile;
```

We have made sure that our Profile component needs to receive two string when called.
Let's test this behaviour by importing and calling the component in the App component.
We can use TypeScript auto-import capabilities and add `<Profile/>` in the JSX of App.tsx. It should suggest automatically to import the component.

Before we even try to run the web server, we are now able the see errors specifying that the profile component is missing props: "Type '{}' is missing the following properties from type 'Props': firstName, lastName"

TypeScript helps us make sure that the correct props are being passed between components.
If we want to specify that a prop is optional we can declare it using the optional property "?".
To make the lastName property optional:

```ts
interface Props {
  firstName: string;
  lastName?: string;
}
```

## Automatic type inferring & any

It is possible to bypass type checking by simply using the `any` type. That allows you to opt out of typescript but also negates all of its benefits. It's also worth noting that typescript can provide automatic documentation for your code because the editor will automatically pick up the type definitions.
Anybody using your code will get intellisense on the shape and purpose of it, making it way more efficient to work collaboratively without having to write or read documentation.
In many cases typescript can automatically infer the type from usage. For this simply hover on the suggested code and generate the types. Make sure to check the types generated as TS might have used a wrong shape of type or the type `any`.

## Implicit and Explicit typing

In some cases, TS can automatically infer the type from usage. This can sometimes be really helpful.
Let's create a state for a username variable with useState in the App component. We can ensure that only a string will be used for the username as follows:

```ts
const [username, setUserName] = useState("coolguy420");
```

Now if we try to set username to something that is not a string `setUserName(23)` TS will show an error as username was implicitly typed as a string.
We can, however, use angle brackets `< >` to explicitly type the state.
If our state needs to have more than one type, we can use the "|" operator to describe all the types. For example, if the value can be "null":

```ts
const [username, setUserName] = useState<string | null>();
```

Note that the type null and undefined are two different types.

## Definition files

We can create definition files to store all the custom definitions using '.d' in the filename. In React we can add a folder named "@types" in the src folder of our app and a file named index.d.ts.\
This file will centralize all the types and interface that we created and can be accessed by all components.
To group types in categories in the index.d.ts, we can create namespaces:

```ts
namespace PersonsN {
  interface Person {
    firstName: string;
    lastName?: string;
    age: number;
  }
  type Persons = Person[];
}
```

Our Profile component would then be declared as follow:

```ts
const Profile: React.FC<PersonsN.Person> = ({ firstName, lastName, age }) => {
```

## Understanding the types definitions

TypeScript provides us a lot of information on type errors to help us understand what it is expecting.
These errors might seem very hard to understand at first but if you try to analyse them you will see that they provide you with a lot of information.

Let's install a third party library e.g react-bootstrap. In order to access the types definitions for this library, we also need to install the associated type definition package:

```cmd
npm i react-bootstrap @types/react-bootstrap
```

Note that if try to import from a library that has not been installed, TS will throw an error.
Now we create a card component that we import from react-bootstrap:

```tsx
<Card style={{ width: "18rem" }}>
  <Card.Img variant="top" src="holder.js/100px180" />
  <Card.Body>
    <Card.Title>Card Title</Card.Title>
    <Card.Text>
      Some quick example text to build on the card title and make up the bulk of the card's content.
    </Card.Text>
  </Card.Body>
</Card>
```

If you click on "Card" in the imports while holding the control key. You will be redirected to the type definition for the Bootstrap card located in the file `Card.d.ts` in the node modules.

````ts
declare type Card = BsPrefixRefForwardingComponent<'div', CardProps> & {
    Img: typeof CardImg;
    Title: typeof CardTitle;
    Subtitle: typeof CardSubtitle;
    Body: typeof CardBody;
    Link: typeof CardLink;
    Text: typeof CardText;
    Header: typeof CardHeader;
    Footer: typeof CardFooter;
    ImgOverlay: typeof CardImgOverlay;
};
```
````
