---
title: Sprint 2 - NLP with Hugging Face
---


## Hugging Face

[huggingface.co](https://huggingface.co/) is an [online AI community platform](https://www.youtube.com/watch?v=jBFFUwL0TyY\&ab_channel=EyeonTech) that is a huge hub for open-source AI models, here you can deploy and/or download pre-trained foundation models. Their library of models is constantly growing and improving.

Say we want to perform some **sentiment analysis** on the news titles we scraped from U.Today. Sentiment analysis utilizes **Natural Language Processing** (**NLP**) which is an AI tool that combines machine learning with computational linguistics to enable computers to interpret and generate text and speech that mimics human speech patterns. This is how large language models like ChatGPT are able to understand your queries, and then generate answers as if you are speaking to a person rather than a machine.

NLP is also commonly used as a strategy in business operations to automate tasks, freeing up human employees to focus on what is most important. An example is sentiment analysis of text being sent through AI customer service: if the user is very frustrated or angry, they can be redirected to a person before things escalate further. The same could be used for reviews: bad reviews need to be addressed ASAP!

This is essentially a classification problem. An NLP model can "classify" the sentiment of a block of text as **positive**, **negative**, or **neutral**.

Running an NLP model locally can be quite heavy for your computer, so Hugging Face have a convenient [Serverless Inference API](https://huggingface.co/docs/inference-providers/en/index) that let's us send requests to thousands of models without the need to download and configure them locally. First step, you'll need to sign up and [generate a token](https://huggingface.co/settings/tokens). The [documentation](https://huggingface.co/docs/hub/en/security-tokens) recommends generating a **fine-grained** token with the scope to **Make calls to the serverless Inference API**. You will only get to see your token once, so make sure you copy and save it to your `.env`.

You can use the search feature on Hugging Face to search through thousands of model options! To search for something we could use for our specific task, go to "models", and on the left we can filter by task: "text classification". Then we can start searching for models that will do "sentiment analysis". Some have been trained for very specific types of input!

A model well-suited to our task is [DistilRoberta-financial-sentiment](https://huggingface.co/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis). As we've learned in our own machine learning journey, the more specific the problem, the better a machine learning model will perform. This model has been trained to recognize sentiment specifically in vocabulary and language related to finance (in English).

## POST Requests

The Inference API requires you to send a [POST request](https://www.w3schools.com/python/ref_requests_post.asp). Until now we have only been sending GET HTTP requests, sending a POST request gives you the option to append additional headers and a request body. The Hugging Face [documentation](https://huggingface.co/docs/inference-providers/en/index#python) gives a very clear example of how to make a POST request in Python using the `requests` library, and how to append your token as an **authorization header** and your inputs as **payload**/**request body**.

If you want, use Postman first to test a request.

```python
from dotenv import load_dotenv
import os
import requests

load_dotenv()
api_key = os.getenv("HF_API_KEY")

url = "https://api-inference.huggingface.co/models/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis"
headers = { "Authorization": f"Bearer {api_key}" }
payload = { "inputs": ["How Britain can seize the next decade"] }

response = requests.post(url, headers=headers, json=payload)
response.json()
```

> **Optional Task**: Add a new column to the table holding the data from U.Today for a sentiment analysis of the title. Write code that populates that column for the existing data. Then write a new Lambda function, or update your existing Lambda functions, to perform this process for new titles as you scrape and add them to your database each day on AWS.

## What could go wrong?

### Cold Model

Hugging Face models are not active all the time. When a model goes unused for a time, it will go "cold". Active models are "warm", and when you request them you will get a response right away. Cold models will need to be loaded before you get a response, and your request will receive a **503 status code** response.

The documentation offers an additional `"x-wait-for-model": "true"` header that can be appended to the headers, but they only recommend using this if the model is cold. Best practice is to make a regular request, and if you get a 503 error, resend the request with the wait-for-model header.

```python
if response.status_code == 503:
  headers["x-wait-for-model"] = "true"
  response = requests.post(url, headers=headers, json=payload)

response.json()
```

### AWS timeout

AWS Lambda functions are set by default to throw an error if the function runs for longer than 3 seconds. If we have to wait for a cold model to load, our function would fail. So we can set a longer timeout in the configuration menu. For the cold model warmup, a time of 30-60 seconds might be necessary. For your other functions, you could set the time to 10-30 seconds, as there might also be a delay connecting to your external database.
