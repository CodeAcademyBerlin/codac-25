---
title: Sprint 1
---


## Epic 1: Introduction to HTML and CSS

### Familiarize with your new best friend, your code editor!

The choice of the integrated development environment(IDE) is very personal, therefore you are free to use whichever you prefer, but make sure you install the following extensions:

* **Live Server**: launch a local development server with live reload feature for static & dynamic pages
* **HTML Snippets**: write part of the HTML tag and select the right snippet
* **Prettier** or **Beautify**: They are both code formatters, the first will format your code on save, the second by clicking a button
* **Formatting Toggle**: allows you to toggle the formatter (Prettier, Beautify, …) ON and OFF with a simple click

If you don't have a preference, we recommend using Visual Studio Code. You can install it from here: <https://code.visualstudio.com/>.

### Let's now try to create a webpage

The magic of web pages is that they use nothing more than plain text files. Plain text files have no fancy fonts, no colors, no pictures, no clickable links, and no animations. How then do web pages appear with all these things? With markup.

Markup means that some of the text in a web page file is code that describes what to do with other text in the file. This code can say "make the following text be blue and bold" or "display the image that is in the following file." There are two important coding languages used to do this: **HTML** and **CSS**.

HTML stands for Hypertext Markup Language. Hypertext refers to the fact that HTML web pages can have links, i.e., text that when you click on it, you jump to another web page. This markup lets us hyperlink HTML files together into the web of documents we know so well today. HTML is used to label what different pieces of content are for, such as titles, sections, links, lists, tables, and images.

Open your editor and create a file called `index.html`

Paste this code in it, save and open the file on Chrome either by double-clicking or using the Live Server extension

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My first webpage!</title>
  </head>
  <body></body>
</html>
```

Don't worry about this syntax now, it will be further explained by your mentors during the next lesson.
The most important thing that you need to know is that all the things that you want to appear on the page need to be in between the opening body tag and the closing one.

Try to insert an h1 tag:

```html
<h1>This is my first webpage</h1>
```

Save, and if nothing changes on the browser, refresh.

This is how you create HTML elements. Most elements have an opening and a closing tag, your content will go inside those tags. HTML tags are surrounded by angle brackets, and the closing tag will have a forward slash before the element name: `<element>content</element>`

Some elements, such as an img element, don't actually hold any content and therefore don't need a separate closing tag. These elements are called self-closing, and the closing slash can be put at the end: `<element />`

Elements can have attributes, which are included inside the opening tag. Attributes can modify the look, functionality, and behaviors of an element. Don't worry, you don't have to remember them all, this is why we have Google!

Now try to add an image and create a paragraph with some text in it. We know you don't know how, but it's time to try to Google something!

To add a bit of color to your title, add a style attribute:

```html
<h1 style="color: red;">This is my first webpage</h1>
```

Cool no? So now make also the paragraph red.

This HTML file is already getting messy when we have both elements and style property in the same tag no?

This is where CSS will come to help us.

Remove the style attribute to your h1 and p elements.
In the same folder where you have the index page, create a `style.css` file.
Link it to your index page: <https://www.w3schools.com/html/html_css.asp>

And then try to color those elements in red.

The number one rule of coding is Don't Repeat Your Code (DRY) and it looks like we are repeating this style property twice in the same file.

Paste this code into it:

```css
.red-text {
  color: red;
}
```

Now add the class name "red-text" to the class attribute of your h1 and p elements (Google it).

In this way, we can write the property color only once and apply it to all the elements we want.

### Browser, Server, and HTTP

The web works because programs running on computers on the Internet send HTML and CSS files to each other, and display those files to you.
A web browser is a program you run on your computer that reads HTML and CSS and creates the visual display so familiar to web surfers. Web browsers are very complicated programs, but HTML and CSS files are comparatively quite simple.

A web server is a program running on some other computer that sends HTML and other types of files over a network to web browsers. It does this when it gets a request for a file. Those requests are themselves written in a language called HTTP, which stands for HyperText Transfer Protocol. You don't need to know what HTTP looks like to create web pages.

A web server and network connection are not required to see what an HTML file looks like. A web browser can open an HTML file you have on your own computer. This makes initial development and testing of web pages very easy.

A very useful tool when creating and testing web pages is an HTML validator. This is a program that checks your HTML for bad HTML syntax, from punctuation problems to the use of outdated HTML tags. The fact that a page looks OK in your browser is not a good test of your HTML. Browsers try to handle bad HTML, but they do so in different ways. A page with bad HTML might look fine in Firefox and completely broken in Internet Explorer. Fortunately, the World Wide Web Consortium (W3C) provides a free online HTML validator. You can find it here: <https://validator.w3.org/>. It works for CSS too!

It's a good idea to already check if your syntax is correct by uploading the HTML and the CSS files. If you have errors try to solve them and then go to the next chapter.

### Your task for today

Your task for the rest of the day is to try to experiment a bit with HTML and CSS by creating a one-page blog-style website about yourself.
You have complete freedom regarding how it should look like, but you must have the following features:

* only one title
* at least one picture
* at least one paragraph
* a clickable email that opens your email app with the address in the To: field (it sounds tougher than it is, don't worry and check this: <https://www.w3schools.com/html/html_links.asp>)

## Epic 2: Project Kick-Off

\<iframe style="aspect-ratio: 4/3; width: 90%" src="https://docs.google.com/presentation/d/1tXoWvfL2OQvxMnJJTIayL\_1n0UPS0mDfW2mgJX2rzp8/embed?start=false\&loop=false\&delayms=3000\&slide=id.g25f6af9dd6\_0\_0"/>

### Think of a design

Now that you have all the base knowledge you can think of a website of your choice where you should have the following features:

* 4 pages (Home, Registration/Reservation page, Special page, Contact)
* Navigation between pages
* On the Home page you must have a title, some pictures, and text
* On the Registration/Reservation page there must be text inputs, radio and checkbox inputs, select tags and a submit button. At the bottom, you should display a list of Terms and Conditions resembling the one in the mock-up
* On the Special page there must be a table displaying some data
* On the Contact page there must be an email and a map

Of course, you are free to add as many pages and features as you like, but you should finish the minimum requirements described above first.

[Here](https://www.figma.com/file/L6CNEXvyGoXKlqVC3VVAcA/Wireframing) you will find a mock-up example made with Figma, one of the most popular web design software. There is a free starter package, and once you have an account you can duplicate this board and start moving, adding, and deleting the elements to create your own design!

**Don't panic!**

We will guide you through these steps day by day.

## Epic 3: Your First Website

### Create 2 HTML files and 1 CSS

Start by creating your Home (index.html) and Contact (contact.html) pages along with a style file (style.css). For now, it is best to name all files with lower case letters, and without spaces.

To position elements on the page use these CSS properties: <https://www.w3schools.com/css/css_positioning.asp>

**Tip**: Elements can be nested inside one another. In fact, all the code you"re writing will be nested inside the outermost HTML element, the `<html>` tags. On a smaller scale, if you group elements within `<div>` or `<span>` elements it"s easier to move them as a block. Think of them like boxes!

To add a map, follow the steps in the [Google Maps Guide](https://support.google.com/maps/answer/144361?hl=enation/staticmaps/index\&visit_id=636938781544184264-1339397471\&rd=1).

### Connect Home and Contact pages with a navigation bar

For a user to navigate between pages of the same website you need to implement a navigation bar. The principle is fairly simple, you just need to add links in both pages that link to the path of the file you want to go to. It"s odd though if you link the Home page on the Home page, so make sure you only add links to the other pages, not to the one where the user is at that moment.

Here you can find examples of how to create a navigation bar, you can choose if you want to have it horizontal or vertical but keep consistency among all the pages: <https://www.w3schools.com/css/css_navbar.asp>

### Create the Special Page

It"s now time to create the page where you want to display some data (food menu, timetable, opening times). You can put what you want in it, but make sure you use a table element. Style it according to your design.

**Remember to add the link to this page in the navigation bar!**

### Create a HTML file for the Registration Page

On this page, you must have different kinds of inputs and a Submit button. Start creating those elements by following this example: <https://www.w3schools.com/html/html_forms.asp>

The action attribute on the form element is the page/script that will be triggered when clicking on submit, e.g., `<form action="/confirmation-page.html"`. For this to happen, the submit input should have a type attribute of "submit".

**Tip**: input and label are made to be connected. Try to play with the examples on W3School to understand how and when to implement it on your page.

Don't worry too much about positioning the elements, we will give you some tools next week that will help you with that.

Use ordered and unordered lists to write down your Terms and Conditions. It"s very important to keep proper indentation to see directly from your code how elements are nested into each other.

**Remember to add the link to this page in the navigation bar!**

Once you are done with this page, please validate all your HTML files and your CSS on the [Validator](https://validator.w3.org/)

Solve any errors that are shown.

### Extra

Create a Confirmation Page where you will direct the user when clicking on Submit (remember to use the action attribute on the form element). This is a nice page to have that confirms the data submitted has been received. This page could be styled according to your design and it could have a button to go back.
