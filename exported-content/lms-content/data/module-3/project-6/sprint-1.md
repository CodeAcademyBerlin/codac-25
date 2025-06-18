---
title: Sprint 1
---


## Epic 1: Get data from an API

We will use a free Stock API that will provide us with information about the current value of Bitcoin in the stock market.

First you need to sign up on [Alpha Vantage](https://www.alphavantage.co/support/#api-key) and claim your free **API Key**. An API key is a unique string associated with your account. It is very common for a free API to issue API tokens/keys so they can track the number of requests made by specific users. If you exceed the amount of requests allocated for the free plan, they may temporarily block you. Every API has different policies regarding request limits per second / day / week / month, so when working with APIs you will always have to spend some time reading their documentation.

For this specific API, you can find the documentation [here](https://www.alphavantage.co/documentation/#). Don't start by reading everything, we will guide you through the next steps.

### API Endpoints

An endpoint is simply a URL, but instead of requesting HTML to render a webpage, we are requesting only data. APIs have always one **base URL** and several **endpoints**. This means that from the same API you can get different data depending on the endpoint you use. The same way you can specify to a website you want to go to `www.example.com/homepage` or to `www.example.com/info`, you will construct an endpoint to specify which information you want to receive.

**Let's make a real-world comparison**

You are at a tech bootcamp canteen and want to order some food and something to drink. The canteen space is our API, so let's say that `www.CAB-canteen.com` is our **base URL**. First, you go to the bar, which is going to be the first endpoint. You need to tell the cashier what you want and then pay. The cashier is our API endpoint:

`www.CAB-canteen.com/drinks`

The cashier takes your money and passes your order to the person responsible for making your drink (which is the server). When the drink is ready, the cashier will hand it to you. After you successfully get your drink, you head to the food section where you repeat the process. In this case, the cashier of the food section is another person (ie. another endpoint!):

`www.CAB-canteen.com/food`

The process for ordering (ie. requesting) your food is the same as for ordering your drink. The act of requesting a drink or some food can be translated into what we call a **GET request**. We ask a specific endpoint for something, and we get it back in return.

Now, what happens when there is a menu of items, and we need to specify exactly _which_ drink and food we want to order?

### Query Parameters

Some API endpoints give you the possibility to add **query parameters**, which is a way to specify exactly what you want. Back to our example, we can say that when we ordered the mojito, we made a GET request to:

`www.CAB-canteen.com/drinks?name=mojito`

The **?** means that from that character on, we will start to list query parameters, which are made of `key=value` pairs. Of course we cannot specify _any_ query parameter. If we send a GET request to `www.CAB-canteen.com/drinks?name=pizza`, the cashier will come back to us with an error (pizza is not a drink).

We can do the same for the food section and send a request to:

`www.CAB-canteen.com/food?name=pizza`

Of course there are a lot of things that could go wrong in this process. For example, say you order a strawberry drink and they are out of strawberries, or the bartender can make some mistake mixing your drink. If something like this happens, you will be notified by the cashier (the API will display an error message).

### API Keys/Tokens

We are missing only one thing here: you can get drinks and food from the CAB canteen _only_ if you are a student or a mentor. Also, any student or mentor can only order a maximum of 2 drinks and 2 meals per day. So when you order something, you need to show your CAB-card to the cashier, which has an ID assigned specifically to you. When the cashier inputs this ID into their app, the app will tell them whether it is valid, and whether the person can still order something to eat or drink.

This is our **API Key**. Each API has a slightly different way of calling it, or a slightly different way of reading it. To make it simple, let's just use the same name and way of reading it as the the stocks API (the API key will be added as a query parameter to the endpoint).

In order to get something to drink or to eat, we have to include our ID in every GET request we do. So when we want to order our mojito, we will have to make a request like this:

`www.CAB-canteen.com/drinks?name=Mojito&apikey=iahsveqehrvehqrv546646`.

The same will go for food, the query parameter `apikey=iahsveqehrvehqrv546646` must be added to every request we make.

![CAB canteen](staticAsset/data/Module-3/cab-canteen.png "CAB canteen")

Now that you understand better what we will be doing, make your first request to [this endpoint](https://www.alphavantage.co/query?function=TIME_SERIES_DAILY\&symbol=IBM\&apikey=demo) and have a look at the JSON response in the browser. The "apikey" query parameter will accept "demo" for a few requests, but you will eventually need to put your own personal api key. Change the symbol query parameter to look at a different stock (e.g. tsla).

### Postman

[Postman](https://www.postman.com/) is a very useful software for testing APIs, because it doesn't require you to write any code. You just have to construct the endpoint URL correctly and it will send the request for you. It also helps you construct longer endpoints by providing a UI in which you can easily enter key/value pairs for query parameters.

If you want, you can explore some other, free APIs [here](https://lms.codeacademyberlin.com/content/data/Module-3/Free-APIs). Read the documentation for each, and make some requests in the browser, or in Postman, to get some practice.

> **Task**: Use the documentation for [this endpoint](https://www.alphavantage.co/documentation/#currency-daily) to request a daily historical time series for a digital currency (BTC is the symbol for Bitcoin, or you can use another currency of choice) in the European market. Once you see the response, we can code the request to get the data in Python!

## Epic 2: Code the GET request in Python

There are a lot of libraries in Python to make http requests. We will use one called [`requests`](https://pypi.org/project/requests/). Make sure it is installed in the Anaconda project environment. Simply specify the request type ("get"), and the endpoint:

```python
import requests

url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=" + api_key
response = requests.get(url)
print(response.status_code)
data = response.json()
print(data)
```

Replace `api_key` and put your personal API key. The `response` is an HTTP response object which contains [a lot of information](https://www.w3schools.com/PYTHON/ref_requests_response.asp), the most relevant to us will be `status_code` and `json()`.

**HTTP status codes** are a way to quickly communicate whether a request was successful. Each code represents a [status message](https://www.w3schools.com/tags/ref_httpmessages.asp), so you should check that your status code falls within the 200 range before proceeding with your code, as anything in this range is considered a successful request! If you have a status code in the 400-500's, your request has failed and you will have an error.

**Tip**: if you don't need the exact status code, you can also refer to `response.ok`, which returns a boolean if your status falls in the successful range. This is great for quick conditions!

The `data` returned by `response.json()` is in [**JSON (JavaScript Object Notation)** format](https://www.w3schools.com/whatis/whatis_json.asp). This is basically the same as regular Python, but JSON tends to use rather large dictionaries. Some APIs (including this one!) give the possibility to use query parameters to define an alternative data type for the response.

Whether your response is JSON or CSV, you're going to need to use regular Python to manipulate the data into the shape you will store in an SQL table, so consider how you can arrange this data to fit that format. You might need to brush up on [for loops](https://www.w3schools.com/python/python_for_loops.asp), and how to access values that are [nested within a dictionary](https://www.w3schools.com/python/python_dictionaries_nested.asp).

> **Task**: Design an SQL table that will hold the data from this API endpoint, then request and manipulate the data into the correct form. If you like, you can put it into an SQLite database for now, but we will be deploying a Cloud Postgres database on Supabase later this week.

### Environment Variables

Sometimes you'll need to use variables in your code that cannot be shared online. Your API key is a perfect example of this! This key is linked to your account, you don't want anybody else using it. If you just have it hard-coded into your code which is then pushed to GitHub, anyone that can see your repository can take it, so we will look at how to keep data private.

The filetype `.env` is used to store environment variables, which will be `KEY=value` pairs. Reading this file, however, requires the help of an additional Python package called [python-dotenv](https://pypi.org/project/python-dotenv/). Use Anaconda Navigator to add this to your Project Environment, then create a file called `.env` and set your API key to a variable. You can include string quotes if you want, but since this file is not a Python file, the data type is not going to be recognized. It is common practice to name environment variables in all capital letters:

```env
API_KEY=iahsveqehrvehqrv546646
```

Before you commit anything to git, **make sure the `.env` is in your `.gitignore`!!!!**

To access the value of this variable from your main Python script, use the `dotenv` package and `os` (operating system) module.

```python
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("API_KEY")

print(api_key)
```

## Epic 3: Scrape data from a website

**Web Scraping** is the process of crawling across a webpage and collecting the text content. Some popular services, such as SkyScanner, collect data from many sources and display it all together for their users to compare.

Web scraping is often considered an option if there is no API, but beware that it lies in a grey area in terms of ethics and legality. You should not scrape data that isn't publicly available, and many websites have implemented protection measures to prevent web scrapers from taking their data. But in many cases, it is a perfectly acceptable data collection method, especially as a learning exercise.

If you want to check a website's policy on scraping, most websites have a file called `robots.txt`, which will be the base URL + "/robots.txt". This will contain rules to communicate to bots crawling the site what they should and shouldn't do.

### HTML

The main content of a webpage is displayed in HTML (HyperText Markup Language) files. Web browsers format the HTML elements, but additional styling and functionality can be added with CSS (Cascading Style Sheet) and JavaScript. The code for CSS and JavaScript are commonly written in separate files and imported into the HTML to save space, but not always!

We can use the **inspector tool** in a web browser to look at the HTML of any webpage (right click + inspect). Open the inspector to view the HTML for [www.example.com](https://www.example.com). You will see that [HTML elements](https://www.w3schools.com/html/html_elements.asp) use angled brackets to define opening and closing tags. Most elements will have both an opening and a closing tag (a closing tag is indicated with a forward slash.) However some elements are self-closing, usually because they hold no content and so two tags would be redundant.

HTML elements will have **attributes** that can modify their look, functionality, or behavior. These are always in the opening tag.

![HTML element anatomy](staticAsset/data/Module-3/html-anatomy.png "HTML element anatomy")

There are over 100 different tags, each serving a different purpose. Some tags (such as `<div>`, `<span>`, or `<article>`) only serve the purpose of grouping other elements together. Since we want text content from the webpage, we will be looking for mostly text elements, such as `<p>`, `<h1>`, or `<a>`, but it could be that the text content you want is actually the value of an attribute, such as the `href` of an `<a>` (hyperlink reference), or the `src` of an `<img>` (image source).

> **Task**: Open the tech news website [U.Today](https://u.today/) and use their search feature to see a list of articles related to your API cryptocurrency. Notice how the URL at the top changes - they are using query parameters!

Open the inspector, and see if you can find the elements for each article that hold the text content for the title.

### Beautiful Soup

Since U.Today is a static website, it is perfect for the Python library [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/). Use the Anaconda Navigator to add `beautifulsoup4` to your project environment.

We will need to use the `requests` library to make an HTTP request to the webpage we wish to scrape data from. That response text can then be passed into the Beautiful Soup library to be parsed from HTML:

```python
import requests
import bs4

def scrape_data():
    url = "https://www.example.com"
    response = requests.get(url)
    soup = bs4.BeautifulSoup(response.text, 'html.parser')
    print(soup)
    return soup

data = scrape_data()
```

Beautiful Soup provide us with multiple options to target elements in the HTML. Once you have targeted an element, you can extract the data you want, but just the targeting process can be a bit tricky! You will need to find something unique about the element/s you are targeting (usually a combination of attributes). It might be necessary to narrow the scope of your search by first targeting a grouping element (such as a `<div>`), and then performing a search within that.

You can use one of 4 main methods to search:

* `select_one()` returns the _first single element_ that matches the specified CSS selector
* `select()` returns a list of _all_ elements that match the specified CSS selector
* `find()` returns the _first single element_ that matches your specifications
* `findall()` returns _all_ elements that match your specifications

If you wish to use the select methods, you will need to research [CSS selectors](https://www.w3schools.com/cssref/css_selectors.php). This is how web developers target elements to apply CSS for styling, and is an extremely useful syntax to be familiar with. The game [CSS Diner](https://flukeout.github.io/) is an excellent starting point.

If you prefer, the find methods take many arguments, the simplest is probably `attrs={}`, where you specify a dictionary of the `attribute: value` pairs of your element. For example, to select an element that looks like:

```html
<p class="red">this is a paragraph</p>
```

You can use either of the following:

```python
p1 = soup.find("p", attrs={"class": "red"})
p2 = soup.select_one("p.red")
```

Classes are a particularly good attribute to target. Many elements can share the same class, but the combination of classes applied to any element (or pattern of element, such as the titles on your news articles) often form unique combinations. It is never guaranteed however, so you must always check the returned value of your selection before proceeding to the next step.

Once you have an element, you can extract the text using [.getText()](https://www.crummy.com/software/BeautifulSoup/bs4/doc/#get-text), or target any of the attributes using Python dictionary notation:

```python
classList = p1["class"]
# [red]
textContent = p1.getText()
# 'this is a paragraph'
```

The dummy websites [Books to Scrape](https://books.toscrape.com/) and [Quotes to Scrape](https://quotes.toscrape.com/) exist for people to practice their scraping skills. Take some time to find some elements in the inspector, and then try to target them in Python using Beautiful Soup. These pages are quite simplified, and so make a great place to start building your understanding of HTML and the scraping library toolkit.

> **Task**: Use Beautiful Soup to scrape some data from the list of articles you found on U.Today. Design an SQL table to hold that data - you will need at least the date and the title, but feel free to save additional data if you want.

## Epic 4: Store your data in an SQL database on Supabase

We will use [Supabase](https://supabase.com/)'s database hosting service, where we can put our SQL tables into a PostgreSQL database on the Cloud. You will need to sign up to the service, and you will be prompted to create your first "Org" (organization). Make sure you select the free plan!

From your Org dashboard, create a new project. Name your project, and whether you enter or generate the database password, save it somewhere safe for now - we'll need it later!

From your project dashboard, you'll see that Supabase offers many backend-as-a-service services. The icon menu on the left will open when you hover, click on "Database" to see an overview of your empty PostgreSQL database. Supabase provide a UI to manage the database, but we are going to connect it to our Python codebase. On the very top menu bar, click "Connect".

Until the "Connection String" tab, copy the "Direct connection" string. This string holds credentials that allow access to your database, **it must be kept private**. Add it to your `.env` as a variable called `DB_CONN`, then replace the characters `[YOUR-PASSWORD]` with the database password you set aside earlier.

```python
dbconn = os.getenv("DBCONN")
```

Install `psycopg` (or Python Postgres library of your choice) into your Anaconda project environment and create a function called `create_table()`. Follow the [documentation](https://www.psycopg.org/docs/usage.html) to connect to the database and create a cursor, then execute an SQL query to create a table for your API data. Note you will need the connection to `.commit()` any changes before you see them applied to your database.

```python
import psycopg

def create_table():
    conn = psycopg.connect(dbconn)
    cur = conn.cursor()
    cur.execute(
        '''
            CREATE TABLE IF NOT EXISTS api_data(
                date TIMESTAMP PRIMARY KEY,
                open FLOAT,
                close FLOAT
            );
        '''
    )
    conn.commit()
    cur.close()
    conn.close()

create_table()
```

Follow the same logic to create a function that executes an SQL query to also create a table for the data you scraped from U.Today. Then write functions to execute queries that add data to your tables (make note of how to use [parameter placeholders](https://www.psycopg.org/docs/usage.html#passing-parameters-to-sql-queries) for more secure code.) E.g.

```python
from datetime import datetime

conn = psycopg.connect(dbconn)
cur = conn.cursor()

cur.execute(
    '''
        INSERT INTO api_data(date, open, close)
        VALUES (%s, %s, %s);
    ''', 
    (datetime.strptime("2025-02-20", "%Y-%m-%d"), "92676.24000000", "92680.67000000")
)

conn.commit()
cur.close()
conn.close()
```

\<!-- ## Epic 3: Store your values in a Google Spreadsheet

Start by creating a new Google spreadsheet with 2 columns: date and price. Select the A + B columns, and on the right click \*\*+ Add a range\*\* and name it \`my\_range\` (it should be connected to \`Sheet1!A:B\`). This will make adding data a bit easier later.

Go to the \[Google Cloud Platform]\(https://console.cloud.google.com/welcome) and create a new project. Go in the tab for \*\*APIs & Services\*\*, and under \*\*Credentials\*\* click on \*\*Create Credentials\*\*. Select \*\*Service Account\*\*. Once you have created the Service Account credentials, copy the email and add it in the sharing settings of your Google Spreadsheet.

From the same page, click on the email of Service Accounts, then go in the \*\*Keys\*\* tab and click on \*\*Add Key\*\* to \*\*Create new key\*\*. Select the \*\*JSON\*\* type. This will automatically download a file containing all the necessary keys for your code to communicate with the Service Account. Move the file from your downloads folder into your project folder, then rename it \`service\_account.json\`.

Go back to the Dashboard of the API and Services and click on \*\*Enabled APIs & Services\*\*. Search for \*\*Google Drive API\*\* and \*\*Google Sheets API\*\* and enable both.

Now we can start using these 2 APIs from our code to save data into the Google spreadsheet. There are several libraries to help us do that, we recommend using one called \[\`gspread\`]\(https://docs.gspread.org/en/v6.1.3/). Unfortunately, this library isn't in the Anaconda install catalogue, so we will need to install it through the terminal. From the Anaconda interface, click the green arrow for this project environment and click \*\*Open Terminal\*\*. From there, you can run one of \[these scripts]\(https://anaconda.org/conda-forge/gspread) to install it.

Now create a new file called \`google\_service.py\`, and paste the following code:

\`\`\`python
from main import get\_data
import gspread

def save\_data():
&#x20;   \# fetch data from api
&#x20;   data = get\_data()

&#x20;   \# transform data into dataframe with two columns: date, price (close)
&#x20;   dates = \[]
&#x20;   prices = \[]
&#x20;   for date in data\["Time Series (Daily)"]:
&#x20;       dates.append(date)
&#x20;       prices.append(data\["Time Series (Daily)"]\[date]\['4. close'])
&#x20;   df = pd.DataFrame({ "date": dates, "price": prices })

&#x20;   \# connect to Google worksheet
&#x20;   gc = gspread.service\_account(filename="./service\_account.json")
&#x20;   worksheet = gc.open("\<NAME\_OF\_YOUR\_GOOGLE\_SPREADSHEET>").sheet1

&#x20;   \# update the Google worksheet
&#x20;   worksheet.update(values=\[df.columns.values.tolist()] + df.values.tolist(), range\_name='my\_range')
save\_data()
\`\`\`

Run \`python google\_service.py\` from the terminal, then check whether new rows have been added to your Google spreadsheet. -->
