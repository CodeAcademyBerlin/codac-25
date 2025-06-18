---
title: Data Pipeline
---


For this project, you will build what the community refers to as a **Data Pipeline**. A data pipeline is a series of data processing steps. Data pipelines consist of three key elements: a source, a processing step or steps, and a destination. Any time data is processed between point A and point B (or points B, C, and D), there is a data pipeline between those points.

## Data Collection

Some common data collection methods include utilizing a web API, or web scraping. Learning these technologies will also enable you to gather data and potentially produce your own dataset for your final graduation project!

**API**

API means "Application Programming Interface" and it is code which enables data transmission from one software to another. There are different kinds of API, but the most common class of API is the Web API. These APIs mainly deliver requests from web applications and responses from servers using Hypertext Transfer Protocol (HTTP).

![What's an API](staticAsset/data/Module-3/API.jpg "What's an API")

Software A (a website or app) needs some information or functionality (e.g., hotel rates for certain dates, or a route from point A to point B based on a user’s location). Software B has this information, so Software A calls the API of Software B while specifying the requirements of what data/functionality it needs. The Software B returns data/functionality, and Software A is able to use it.

**Web Scraping**

Web scraping is the process of extracting data from websites, like an automated copy-and-paste process. For image searches, this technique is referred to as image scraping. Scraping is not always legal, and so scrapers must first consider the copyrights of a website.

The easiest Python libraries for web scraping are [Beautiful Soup](https://beautiful-soup-4.readthedocs.io/en/latest/) and [Scrapy](https://scrapy.org/). However, they will not work with dynamic web pages, only static pages. _Dynamic_ means the data is generated from a request after the initial page loads. _Static_ means all the data is there at the original call to the site. Another library widely used to overcome the problem of scraping dynamic pages is called [Selenium](https://www.selenium.dev/documentation/webdriver/).

**Cloud Database**

The data we collect through web scraping and APIs can then be saved for analysis. We will show you how to deploy an SQL Server on [Supabase](https://supabase.com/) with PostgreSQL. You will need to design a database to hold the data you're collecting.

## Pipeline Construction

**Web Interface**

Use the popular, web-based Python framework [Streamlit Cloud](https://streamlit.io/cloud) to visualize data from your database, then deploy the app to be shared on the world wide web. You can share the URL with anybody, and they will be able to view and interact with your data. This makes for an excellent portfolio project that can be easily shared with recruiters.

**Automation**

We will guide you to use AWS (Amazon Web Services) [Lambda functions](https://aws.amazon.com/lambda/), together with AWS [Event Bridge](https://aws.amazon.com/eventbridge/), to automate your Python code that collects the data, ensuring your database is updated with fresh data every day.

Time permitting, we will also have a look at [Hugging Face](https://huggingface.co/), a machine learning and data science platform and community that helps users build, deploy and train machine learning models. Their Serverless Inference API let's us utilize machine learning models deployed on their platform. You will use this to apply time series modelling to the data from the API, and sentiment analysis to the scraped data to round out your Streamlit application.

It sounds complicated, but take it step-by-step. You will gain important insights into architecture patterns employed by real-world projects.

**Completion Time**: 2 weeks and 2 days

* **Sprint 1** - 5 days
* **Sprint 2** - 5 days
* **Sprint 3** - 2 days

\<!-- ## Overview -->

\<!-- ### WEEK 1:

1\. Use a free and public Web API to collect some data, which we will then save locally.
2\. Scrape related article titles from a news website using BeautifulSoup and save it locally.
3\. Deploy an SQL Server on \[Railway]\(https://railway.app/) with PostgreSQL. You will need to design a database to hold the data you're collecting. -->

\<!-- 4. Create some graphs using the likes of \[Plotly Express]\(https://plotly.com/python/plotly-express/). -->

\<!-- ### WEEK 2:

1\. Use the popular, web-based Python framework \[Streamlit Cloud]\(https://streamlit.io/cloud) to visualize data from your database, then deploy the app to be shared on the world wide web.
2\. Use \[AWS (Amazon Web Services) Lambda]\(https://aws.amazon.com/lambda/) functions to automate your Python code that requests and scrapes the data, ensuring your database is updated with fresh data every day. -->

\<!-- ### WEEK 3 (OPTIONAL):

1\. Discover NLP (Natural Language Processing) and \[HuggingFace]\(https://huggingface.co/), a machine learning and data science platform and community that helps users build, deploy and train machine learning models.
2\. Apply time series modelling to the data from the API, and sentiment analysis to the scraped news headlines to round out our Streamlit application. -->
