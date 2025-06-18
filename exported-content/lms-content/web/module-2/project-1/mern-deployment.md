---
title: MERN deployment
---


We've chosen [Vercel](https://vercel.com/) as our preferred deployment platform as it's one of the last places online where you can deploy a backend project for free. It's up to you if you want to deploy both parts on the same platform, or you could use a different service like [Netlify](https://www.netlify.com/) for your front-end.

First step: get rid of _all_ errors and warnings. Even something as small as an unused variable can cause a problem with your build. **No red!**

## Back-End deployment

Add a file `vercel.json` to the root of your back-end folder. This is where we set [configuration settings](https://vercel.com/docs/concepts/projects/project-configuration):

```json
{
  "builds": [{
    "src": "./index.js",
    "use": "@vercel/node"
  }],
  "routes": [{
    "src": "/[^.]+",
    "dest": "/",
    "status": 200
  }]
}
```

Stage, commit, and push these changes to GitHub.

Go to Vercel and register (recommended: register with your GitHub credentials). From Overview, click on **Add New..** and select **Project**.  Select your project and **import**.

We'll actually be deploying **two** projects - your client and your server will be deployed separately. So under **Configure Project**, our first step will be to edit the **Root Directory**. Let's select the **server** first:

![Edit Root](staticAsset/web/mern_root-change.png "Edit Root")

Next we need to enter our **Environmental Variables** (we shouldn't have pushed our `.env` to GitHub, so Vercel currently has no access to them). There is a dropdown menu for Environmental Variables: copy and paste your entire `.env` file into these inputs (you can actually paste the entire file, and Vercel will separate the keys from the values):

![Env Variables](staticAsset/web/mern_env-variables.png "Env Variables")

Deploy! The build can sometimes take a few minutes.

When it is finished, click on “Visit”. You will probably see: `Cannot GET /`, or your custom error message if you defined one. That is normal because the app is trying to search for an `index.html` file that we don’t have. At the end of the URL, add one of the routes that you have defined in your backend and check if you see the JSON in the browser (don’t use a protected route!). If you see your data it means you have successfully deployed your backend, congratulations!

## Front-End deployment

If you created your app using Vite, you'll also need to add a `vercel.json` to the root of your front-end folder:

```json
{
  "routes": [{
    "src": "/[^.]+",
    "dest": "/",
    "status": 200
  }]
}
```

We'll also need to update our fetches to send requests to our new deployed back-end domain, instead of `localhost`. There are two ways you can go about this:

1. Create a `config.ts` and define a variable to represent the base URL of your back-end. Check the current mode and set the variable to be either the local port or your deployed domain:

```ts
const serverURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5000"
    : "https://<url-of-your-backend>";

export { serverURL };
```

1. You can create an `.env` file and define a variable to represent the base URL of your back-end: `VITE_SERVER_URL=http://localhost:5000/`. Since we don't push this to GitHub, we'll have to redefine this variable in the Environmental Variables before we deploy.

![Base URL](staticAsset/web/mern_base-url.png "Base URL")

Which ever you choose, you'll have to make sure that your fetches are using this base URL variable instead of a hard-coded value. This way, when we are running in development mode we will use the localhost, when we are running in production mode (the deployed version) we will use the live version.

Stage, commit and push changes to GitHub. You can now follow the same steps to deploy the front-end - change the root to the client folder and set relevant env variables.
