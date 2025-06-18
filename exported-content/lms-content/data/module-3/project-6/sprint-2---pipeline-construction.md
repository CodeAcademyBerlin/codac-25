---
title: Sprint 2 - Pipeline Construction
---


## Epic 1: Install and use Streamlit to display the data from Supabase

[Streamlit](https://streamlit.io/) is a platform used to develop simple front-end web applications to demonstrate your data projects. It can deploy machine learning models, algorithms, and has a vast array of nicely pre-styled components to build interactive data visualizations. No web development skills are necessary, you can implement their widgets entirely through Python, then deploy for free to their Cloud Platform.

Start by using Anaconda Navigator to install `streamlit` in your project environment. Open the Command Palette in VSCode through the "View" menu, or by running \<kbd>Ctrl\</kbd>/\<kbd>Cmd\</kbd> + \<kbd>P\</kbd>, then search for "Python: Select Interpreter" to choose your environment for the terminal. You can now test that Streamlit has correctly installed by running `streamlit hello` from a terminal.  This will run a demo app with some code examples. To exit this development server, you can run \<kbd>Ctrl\</kbd>/\<kbd>Cmd\</kbd> + \<kbd>C\</kbd>, or click the small trashcan icon to kill the terminal.

Create a new file called `streamlit_app.py`. We will not be able to use Jupyter Notebook to run Streamlit.

Streamlit's [Api Reference](https://docs.streamlit.io/develop/api-reference) holds many pre-built components that can be used in Python. Start by looking at some of the [text elements](https://docs.streamlit.io/develop/api-reference/text). Choose one and implement it into your `streamlit_app.py`:

```python
import streamlit as st

st.title("Hello World")
```

To run your app, open a terminal from the folder that holds your file (use `cd` to navigate within the terminal, or right click the file and "open in integrated terminal") and run the script: `streamlit run streamlit_app.py`. Your app should automatically open in a tab in your browser. If you make a change to your code, you can refresh the page, or click "rerun" to see your changes applied.

To demonstrate the interactive potential of Streamlit, take a look at one of the [input widgets](https://docs.streamlit.io/develop/api-reference/widgets). When a user interacts with an input, the value will be returned and can be saved in a variable. Streamlit will re-run the code each time an input value changes, meaning you can make use of the user's selection and update the page.

```python
favourite_mentor = st.selectbox(
    "Who is your favourite CAB mentor?",
    ("Emily", "Muayad", "Raul", "Lucas", "Janina"),
    index=None,
    placeholder="Select your favourite mentor"
)

st.write("Your favourite mentor is: ", favourite_mentor)
```

Streamlit is very well documented, and all components should have clear explanations of all the arguments, and also usually a few implementation examples at the bottom. Take a look through their [data](https://docs.streamlit.io/develop/api-reference/data) and [chart](https://docs.streamlit.io/develop/api-reference/charts) elements! The [line\_chart](https://docs.streamlit.io/develop/api-reference/charts/st.line_chart) will accept a Pandas DataFrame, from which you can define the X- and Y-Axes.

Import `psycopg` (or Python Postgres library of your choice) at the top of your file and create a function called `get_api_data()`. Follow the [documentation](https://www.psycopg.org/docs/usage.html) to connect to the database and create a cursor, then execute an SQL query to select your data from the API table. To view the selected data, use one of the cursor [fetch functions](https://www.psycopg.org/docs/cursor.html#cursor.fetchall), like `.fetchall()`.

While `os.getenv()` works locally, we should instead use Streamlit's own [secret management](https://docs.streamlit.io/develop/concepts/connections/secrets-management). Create a folder called `.streamlit`, and inside create a file called `secrets.toml`. This is the Streamlit equivalent of a `.env`, so make sure to add it to your `.gitignore`! Then copy your `DBCONN` connection string variable into this file. If you haven't been using string quotes around your variables, you will need to add them here, as this is a `.toml` file.

```python
import streamlit as st
import psycopg
import pandas as pd

def get_api_data():
  dbconn = st.secrets["DBCONN"]
  conn = psycopg.connect(dbconn)
  cur = conn.cursor()

  cur.execute('''
    SELECT * FROM api_data;
  ''')
  data = cur.fetchall()

  conn.commit()
  cur.close()
  conn.close()

  return pd.DataFrame(data, columns=["date", "open", "close"])

api_data = get_api_data()
```

Your data will be in the form of a Python list of tuples, each representing a single row in the table. This is one of the formats that `pd.DataFrame()` will accept to create a Pandas DataFrame. Once you have managed to return a DataFrame with all the necessary information, pass it to the `line_chart` and watch Streamlit plot your data!

Write a function that also queries and returns your scraped data, and then display that in a Streamlit [`dataframe`](https://docs.streamlit.io/develop/api-reference/data/st.dataframe).

## Epic 2: Deploy your Streamlit app with Streamlit Cloud

Follow the [documentation](https://docs.streamlit.io/streamlit-cloud/get-started/deploy-an-app) to deploy the app using the Streamlit Cloud service. We will deploy through GitHub, so if you haven't already, you'll need to initialize a repository for this project. You will need to make a few changes to your code however, and it will mean that code will no longer run locally:

1. **Environment variables** will be entered into Streamlit. If you were using `dotenv` and `os` locally, remove them from your imports, and replace the line where you access the variable in your code:
   \~~`dbconn = os.getenv("DBCONN")`~~
   `dbconn = st.secrets["DBCONN"]`
2. All imported packages will need to be included in a file called **requirements.txt**. This is because Streamlit doesn't have access to your Conda environment, they will read this file and install the required packages. Create the file at either the root of your GitHub repo, or at the same level as your `streamlit_app.py`. It will look something like:

```txt
streamlit
pandas
psycopg
psycopg-binary
```

(The Psycopg package is not a pure Python library, and so including `psycopg-binary` is necessary for Streamlit to have all the required code.)

1. Stage, commit, and push these changes to GitHub.
2. From your Streamlit **dashboard**, click "Create app" and "Deploy a public app from GitHub". Select the relevant repository, branch, and your `streamlit_app.py` file. Here you can also customize the app URL.
3. Under "Advanced settings" you'll also be able to customize the Python version, and here you will add your environment variables. Note that you will not be able to use the same connection string that worked locally - go back to your database dashboard on Supabase, open the Connect modal, and this time copy the **Transaction pooler** connection string (you will once again need to replace `[YOUR-PASSWORD]` with your database password.)
4. Click "Deploy" and watch your app go live! When you want to deploy new changes, simply push to GitHub and Streamlit will automatically redeploy the latest version.

Open the link on different devices to appreciate Streamlit's responsive design.

## Epic 3: Use AWS to automate your pipeline

A data pipeline is a set of tools and processes used to **automate** the movement and transformation of data between a source system and a target repository. In other words, it means that we can use serverless functions to do exactly what we have done locally so far, and add a trigger to run the process every day.

If you want to collect the price for Tesla everyday, you don't want to have to manually run your code from your laptop. Instead, you can deploy your code to a platform, and set a trigger to run that code on either a schedule, or at regular intervals.

There are 2 big players that offer these services for a very low price, AWS (Amazon Web Services) or Google Cloud Platform.

In this project we will use two of the AWS services: **AWS Lambda functions** (serverless functions) and **AWS EventBridge** (our trigger). Google Cloud offer the same, but with other names. AWS is a subsidiary of Amazon offering over 200 cloud computing services, including storage, networking, analytics, deployment, and machine learning. It is an enormous platform, and there are people whose entire jobs involve simply navigating their services, so don't let yourself get too overwhelmed!

Create an account on [AWS](https://aws.amazon.com/). During the Sign Up process, you will be asked to give a credit card or SEPA. That is because if you exceed the free tier limit, you will be billed at the end of the month. Don't worry, this project should not exceed the free limits!

### Zero-Spend Budget

Just to be sure, let's set up a Zero-Spend Budget as our first action on AWS. This way, you will be alerted by email if you ever go even 1 cent over your free tier budget of zero:

1. Use the search to find the **Billing and Cost Management** dashboard
2. From the left menu, under **Budgets and Planning**, select **Budgets**
3. Select **Create budget**
4. Under **Budget setup**, select **Use a template (simplified)**
5. Under **Templates**, select **Zero spend budget**
6. Under **Email recipients** specify the email/s through which you would like to be contacted if your incur a spend above $0.01.

### Lambda Functions

Our eventual plan is to have a few [Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html) that run each day to update our database with the most recent data. You can use the code you used to populate your database with the historical data and adapt it to take data from only "today". Instead of adding many rows when you gather data from the Alpha Vantage API, you would extract only the data for the day matching today's date, then add only that. You will do something similar for your web scraping functions.

We are going to follow a best practice of abstracting code into separate functions for specific purposes. This will reduce the upload from one large package into 3-4 smaller uploads, but will also give us an opportunity to explore the way Lambda functions can be connected. Write the following functions:

* A function that requests data from Alpha Vantage API, then separates and returns just the JSON values from today
* A function that accepts that single collection of values and adds them to your Supabase database
* A function that scrapes a few articles from today's news about your cryptocurrency and returns the dates and titles
* A function that accepts those values and adds them as separate rows to your Supabase database

Each of these functions will be uploaded separately to AWS, so to keep everything organized, create an `AWS` folder in your project, then create a sub-folder for each function. Create a file in each sub-folder with the same name as the folder, and copy each function into their own file. Make sure to include all the necessary imports, except for the `dotenv` import, which is not required (AWS have their own system to manage environment variables, which still requires `os` to be imported.) Each function will need to have the parameters `(event, context)`, even if you don't reference them in the code.

![AWS architecture](staticAsset/data/Module-3/aws-architecture.png "AWS architecture")

Once they are working locally, we can start the steps to upload them to AWS! It is important you understand your code at this point, as we are going to need to adapt it slightly for each stage in the Lambda function setup. The code that works locally won't work exactly as it is on AWS, so we will change it for the testing phase, and once our tests are positive, we will need to change it again for the final deployed function.

### Create a new function

From your AWS console, use the search to find the **Lambda Dashboard** and click **Create function**. Select **Author from scratch**, give your function a name, and set the **Runtime** to the version of Python you have set for the Anaconda Environment for this project (you can check this by finding the "python" package installed for that environment in Anaconda Navigator).

There is already some template code in the editor. Edit this code to print the event parameter, then on the right click "Deploy" to apply the changes. We can now test the code using "Test" and then "Invoke".

![AWS lambda screenshot](staticAsset/data/Module-3/initial-lambda-screenshot.png "AWS lambda screenshot")

We can see how the return of the function creates a Response object, and any print statements are able to be viewed as Function Logs. Notice that the `event` parameter is logging the value set to **Event JSON** in the test - `event` is where variables can be passed from one Lambda function to another, and we can mimic this in the testing environment with Event JSON.

### Package Management

It would be great if we could just copy and paste our code directly into this online code editor and fire away! But we are relying on a few external packages to make our code work (requests, psycopg, bs4, etc). Locally, we have Anaconda managing our packages for each environment, but as we learned with Streamlit, external platforms don't have access to this. AWS needs us to actually include the code files for these packages along with our own in order for everything to run properly.

To do this, we are going to install the packages not through Anaconda, but directly into our project folder using `pip install`, and then compress them all into a `.zip` file to be uploaded. (An alternative is to use a [layer](https://docs.aws.amazon.com/lambda/latest/dg/python-layers.html), however this adds even more complexity, so we will not cover that for this project.)

We will follow the steps in the [documentation](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html), which recommends creating a folder called `package` to install all packages for a specific Lambda function. Create a `package` folder for each sub-folder. These folders are going to get quite large, so prevent them (and the `.zip` files we will create from them) from being tracked by Git by adding the following lines to your `.gitignore`:

```
package/
*.zip
```

Let's just start with the function to `get_api_data`. You will need to use the terminal to run a script that not only installs the package, but specifies _where_ to install the package. Open an integrated terminal from your `package` folder for `get_api_data`, and run the following script to install the `requests` package:

```shell
pip install requests -t .
```

Open the package folder and you should see that bunch of new folders have been created there. This is the `requests` library, along with all its dependency packages. If you have any, follow the same logic to install any other packages you are accessing through your Conda environment for that specific function.

Continuing to follow the documentation steps, we are now going to compress this folder into a `.zip` file. If you are using MacOS or Linux operating systems, you can do this directly from the terminal by running the following scripts from your package folder:

```shell
zip -r ../my_deployment_package.zip .
```

This reads all the files inside the package folder and compresses them into a new file called `my_deployment_package.zip`, which is created in the folder above. Move a copy of your `get_api_data.py` into this folder by also running:

```shell
cd .. & zip my_deployment_package.zip filename.py
```

To use the scripts in the terminal, Windows users will need to install something like [Windows Subsystem for Linux WSL](https://learn.microsoft.com/en-us/windows/wsl/install). Or you can just use the Windows UI: select all the files and folders inside `package`, right click, and "Compress to.." + "ZIP File". Name the file `my_deployment_package`, cut and paste it into the main folder, and then drag and drop your `get_api_data.py` into it.

Your folder structure should now look something like:

![After zip folder structure](staticAsset/data/Module-3/after-zip-folder-structure.png "After zip folder structure")

And if you look inside your `my_deployment_package.zip`, the package files should all be at the same level as your own function's Python file (this is important for the imports):

![Deployment package zip](staticAsset/data/Module-3/my_deployment_package.png "Deployment package zip")

### Upload to AWS

Our first package is ready to be uploaded on AWS Lambda functions! This is going to be the first point of our data pipeline.

1. In the Code tab, click on **Upload from** and upload your `my_deployment_package.zip` file.
2. Scroll down to find the **Runtime settings** and click **edit**. Here you will need to change the **Handler**, which is set by default to `lambda_function.lambda_handler`. You might recognize this is the formula `filename.functionname`, so edit it to be `get_api_data.get_api_data` (or whatever names you have assigned to your file and function.)
   ![Runtime](staticAsset/data/Module-3/runtime.png "Runtime")
   This is also where you can change the version of Python, if you need to.
3. Go to the **Configuration** tab, and then in the left menu find **Environment variables**, **edit**, and **Add environment variable** to add your API key. Make sure to remove string quotes from around the value! You will need to use the same Transaction pooler connection string that you used for Streamlit.
4. Go back to the **Code** tab, deploy any unsaved changes, then run a test to see that your function is working

If not, read the errors and address them. Remember that any changes will need to be deployed before the test will run the new code.

### Destination

We will be sending the return value of this function to a second Lambda function through the **+ Add destination** feature, however we must first make that function! We will repeat all the same steps for this new function to upload data to Supabase. You will receive the data through the `event` parameter, though how to access it differs between testing and event-triggered executions. Include both lines in your code, you will comment the one you are not using:

```python
def update_api_table(event, context):
  data = event
  # data = event["responsePayload"]
```

The main blocker for this part is that Psycopg is not a purely Python library and so it needs some special configuration to be compatible with AWS environment. Instead of installing the regular `psycopg` package, we will instead install the `psycopg-binary` package, but it must also be the version compatible with the AWS operating system.

From your update\_api\_table folder, run the following script to install the package with the correct configuration, but pay attention to the version of Python and the target folder (the folder into which the files should be installed.) Edit these values if necessary:

```shell
pip install --platform manylinux2014_x86_64 --target=package --implementation cp --python-version 3.12 --only-binary=:all: --upgrade "psycopg[binary]"
```

**Note:** if you are using `psycopg2` instead of `psycopg`, you can install [`aws-psyocopg2`](https://pypi.org/project/aws-psycopg2/).

Now repeat all the previous steps:

* install any other required packages
* zip your packages
* copy your function `.py` file into the zip file
* upload `.zip` file to AWS
* set runtime
* set environment variables

Now it's time to test if our function works. Since we will be passing data from the first function, first run that function and copy the response. We will use this as "dummy data" to test that our second function works before we connect them for real.

Paste that copied data into the **Event JSON** input for your new function, then invoke the test. If you've followed all steps correctly, you should be able to see that data added to your Supabase database.

## Epic 4: Connect the Lambda functions

It's now time to automate our serverless functions. We will use 2 more tools: **EventBridge** and Lambda **destination**.

Open your first Lambda function and click **+ Add destination**:

1. Select **Asynchronous invocation**
2. Set **Condition** to "On success"
3. Set **Destination type** to "Lambda function"
4. From the **Destination** dropdown, select your second Lambda function
5. **Save** these settings

For the same function, click **+ Add trigger**:

1. Select the source **EventBridge (CloudWatch Events)**
2. Select **Create new rule**
3. Give your rule a name (e.g. "add\_api\_data")
4. Select **Schedule expression**
5. We must define either a **rate** or **cron expression** to determine exactly when and how often our event will trigger. You can research the syntax for [cron expressions](https://tech.forums.softwareag.com/t/everything-you-need-to-know-to-use-cron-expressions-like-a-pro/294852), or the most beginner-friendly way to do this is actually through the "edit" menu for the event, but since we have to enter something here first, you can paste the example `cron(0 17 ? * MON-FRI *)` into the input
6. **Add** the event and rule
7. From the Lambda function, click on the the trigger you just created, or go to the **Configuration** tab, and select **Triggers**
8. Click the name of the rule you set to this trigger, then **Edit**
9. Here we can use the interactive interface to more easily define a cron function (note that the function runs on UTC time, but you can also view how it would run in local time)
10. Set your function to run a few minutes from now
11. Click **Next**, leave all settings as they are, click **Skip to Review and update**, scroll to the bottom and **Update rule**

The last step is to update the code in your second Lambda function - swap the commented lines for the `data`. When the data is passed through the event, it will be in `event["responsePayload"]`, rather than just `event`.

**After you see that everything works correctly and that the database is updated, change the rule to trigger the Lambda function once per day (the time is up to you)**

Congratulations, you have created your first pipeline!

Now you can repeat all the steps to implement a second pipeline with the functions you wrote to scrape data from U.Today and update that table in your database.

\<!-- ## Optional Epic 8: Integrate Facebook Prophet to forecast the price of Tesla in the stock market

Facebook Prophet is a Python and R library developed by Facebook to forecast time series data. You can change only few parameters when using it, therefore we can really see it as a black box that we can hardly inspect to understand what's happening behind.

The reason why we have it here it is definitely not for its relevance in the job market, nor for its reliability when trying to predict something. See it as an exercise of integration, for which you will have to read and understand the documentation, search on google how to integrate it with Streamlit and how to successfully deploy your app. -->
