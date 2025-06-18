---
title: Sprint 2
---


\<iframe style="aspect-ratio: 4/3; width: 90%" src="https://docs.google.com/presentation/d/e/2PACX-1vTjg3-Rc\_6hTfpChLME4MLUBnyTZYEPt8vupkQgQfniiHr2r-iapeFvXUaFyQ4dcXubxleZTQ2JdRtv/embed?start=false\&loop=false\&delayms=3000"/>

## Epic 1: Choose API and Project content

### Choose and test your API

[What is an API](https://www.iotforall.com/what-is-an-api/)

It's time to start thinking about your next website! This time the goal will be to use JavaScript to make your pages more interactive. Again the content is up to you.

Since you will be using live data, first check this list of [Free APIs](/content/web/Module-1/Free-APIs) for examples.

### Start by testing some endpoints

Before starting to write any code or deciding how your website is going to look, it's important to understand how your API works. Carefully read the documentation and use [Postman](https://www.postman.com/) to test the endpoints you want to use.

### Think of a design

In this module you can use a CSS library such as [Bootstrap](https://getbootstrap.com/) to style your pages, therefore you should not spend too much time on it. However, it is always useful to have a simple mock-up of the features you want to include from the beginning.

Minimum Requirements:

* Home Page with the following features:
  * a picture
  * a navigation bar
  * some text
  * a button saying "Show More". When clicked, you should see more text and the button should say "Show Less". When clicked again, you should hide the text mentioned above and turn the button back to "Show More"
* Page to display some of the content of your API with the following features:
  * a table or a list to display the content coming from your API
  * checkboxes or other inputs that will be used to filter some of your data

## Epic 2: Display the response from your API

### Create and style the Home Page

Now start to create the Home page. You can use a CSS library to help with styling.

### Create a JavaScript file and play with Events

After finishing with HTML and CSS it is now time to use JavaScript to show more or less text!
For this problem, you will use a JavaScript click event. [Here](https://www.w3schools.com/jsref/event_onclick.asp) you can find the syntax.

Think of it as two different paragraphs, one that is visible and one that is not.

Then think about what should happen when a user clicks on "Show More": the hidden paragraph should be visible (change of CSS class or change of inline style property) and then the text of the button should change.

Try the same mental process for when the user clicks on "Show Less"

### Create a page to display the content of your API

Create another HTML page and connect it with the Home Page. You can decide what to put on this page, but later on, you must have a table or a list of data pulled from the API of your choice. Therefore it is a good idea to create a div element and assign it an id:

`<div id="api-data"></div>`

### DOM manipulation

Copy the response from Postman into a `data.js` file and assign it to a variable called `data` like this:

```javascript
var data = <"RESPONSE FROM YOUR API">
```

Link this file to your html.

### Create a new JS file called main.js and connect it with the previous HTML page

Make sure that the `data.js` file comes first.

If you linked them correctly over the same html file, from your `main.js` file you should be able to console.log your data from the `data.js` file.

Create a function and with a loop start to append elements to your `<div id="api-data"></div>`.

## Epic 3: AJAX and API calls

Today you will learn about Asynchronous JavaScript and API calls, the two most important concepts in Web Development.

Before the afternoon lesson, take some time to read this article:

[Asynchronous JavaScript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Concepts)

It will help you understand better the concept later today.

### Write a fetch function in your main.js

Comment the data.js file in your html. From now on we will not use the data that we manually copied from the response in Postman, but we will use directly the live data coming from the API.

Create a function and inside write the code to pull live data from your API.

Once you see that you get the right data back, call the function to display the data from the fetch function and send the data received.
