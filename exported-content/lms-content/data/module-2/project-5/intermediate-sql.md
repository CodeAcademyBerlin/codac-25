---
title: Intermediate SQL
---


## Epic 1: SQL in the job market

Log into your LinkedIn account and navigate to the Job section. Search for 'SQL' and filter the results by the territory of your choice (Berlin, Germany, or any other). Add another filter for 'Experience level' to set it to 'Entry level.' Read a few job postings to see the SQL skills companies look for when hiring for their Data team. Save them for later reference when you're applying for jobs.

## Epic 2: Design your first database

As a VS Group BI analyst, you've received a CSV document with all the sales data. You can download the file [here](https://drive.google.com/file/d/1j3BVqD5_KDfvXdljnZ7beV-G-FVS8df5/view?usp=share_link).

Open the file and try to understand how the fields are related. We suggest using Pandas at this stage to inspect and prepare the data into CSV files which will become the database tables. Note that this approach would not be possible with very large datasets. In these cases you would only take a sample of the data to get a feel for the structure and content (e.g. 100K rows).

In order to split the file into tables, we need to have a grasp on database design. This article offers handy tips to design your first database: [Database design basics](https://support.microsoft.com/en-us/office/database-design-basics-eb2159cf-1e30-401a-8084-bd4f9c9ca1f5). Be aware that database design principles are mastered over years through real-world experience. It is also important to note that this is an iterative process - you are not likely to create the perfect design in your first attempt!

Write down your table schemas, remembering to carefully select your primary and, if necessary, foreign keys for each table. You can use a program like [DBDiagram.io](https://dbdiagram.io/home) to help you visualize your tables' shapes and relations.

![example ERD](staticAsset/data/Module-2/Project-5/pets_erd.png "example ERD")

Once you have an initial design for your ERD:

* Can you explain why dividing the information into several tables is preferable to keeping it in a single table?
* How would you manage tables with unique rows such as customers, products, etc.?
* Is there any need to engineer new columns in any of the tables that are not available in the Sample-Superstore.csv (e.g. Supplier price)?

### Pick your RDBMS

You can decide which RDBMS you prefer to use: SQLite, MySQL, or PostgreSQL.

* [SQLite](https://www.sqlite.org/index.html)
* [MySQL](https://dev.mysql.com/downloads/workbench/)
* [PostgreSQL](https://www.postgresql.org/download/)

There will be differences, but the basic steps remain the same regardless of which RDBMS you use. We will continue to use SQLite for the examples in the LMS.

_**Please use the documentation of the RDBMS or Google for a solution if you choose an alternative to SQLite.**_

You will frequently find yourself in a situation where you're new to a program or performing a task you've never done before. Therefore, it is important to be self-reliant and be able to read the program's documentation or find a solution online. Sometimes, despite following every step as it is written in a well-written tutorial, the code will still not work. In this instance, look through several sources, and perform trial and error until you figure it out.

**If you are using SQLite**, you can start with these two resources:

* [sqlite3 tutorial (official Python documentation)](https://docs.python.org/3/library/sqlite3.html#tutorial)
* [SQLite using Python (Geeks for Geeks)](https://www.geeksforgeeks.org/sql-using-python/)

## Epic 3: Loading your database into an RDBMS

Once you have decided on the tables and relationships, and which RDBMS you will use, you will need to consider _how_ you will create and populate your database. Task 9 of the previous project had you import a `.csv` file into an SQLite table using DB Browser, this could be one way you achieve this objective.

Another approach would be to use the Python module `sqlite3`, which comes pre-installed with Python. Give the path to your database file to create a connection (if the database file doesn't exist yet, it will be created automatically). Create a cursor for that connection which can then be used to execute SQL queries. Always make sure to close your cursor and connection when your code is complete, e.g:

```python
import sqlite3

conn = sqlite3.connect("pets.db")
cur = conn.cursor()

create_people_table = """
   CREATE TABLE IF NOT EXISTS People (
      userID INTEGER PRIMARY KEY,
      name TEXT,
      hometown TEXT
   )
"""

cur.execute(create_people_table)

cur.close()
conn.close()
```

Once your database has been created, you will need to start separating the large `.csv` into smaller DataFrames. Make sure you're cleaning your data as you go:

* check for duplicates
* rename columns
* format values such as dates
* create additional features you may require for your database

```python
import pandas as pd

df = pd.read_csv("pets.csv")
```

![example df full](staticAsset/data/Module-2/Project-5/example_df_full.png "example df full")

```python
people = df[["user ID", "person name", "hometown"]].copy()
people.rename(columns={"user ID": "userID", "person name": "name"}, inplace=True)
people.drop_duplicates(inplace=True)
```

![example df people](staticAsset/data/Module-2/Project-5/example_df_people.png "example df people")

Once you have a DataFrame that represents the values for a single table, you can think about how you will populate your database.

The simplest option is to utilize the `.to_sql()` DataFrame method from Pandas. There are quite a few arguments to customize the functionality of this method, have a look at [the documentation](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_sql.html) to make sure you are actually achieving the result you intend. You will need to make sure your DataFrame column labels match your database schema, as Pandas will execute the `INSERT` queries for you, e.g:

```python
conn = sqlite3.connect("pets.db")

people.to_sql(
   "People", # the name of the table
   con=conn, # the connection variable
   index=False, # whether to include the index column
   if_exists="append" # define behavior if table already exists
)

conn.close()
```

Alternatively, you could write the `INSERT` queries manually, and use `execute()` or `executemany()` as demonstrated in the sqlite tutorial linked above. If you follow this path, make sure to read the section in their documentation on using [placeholders](https://docs.python.org/3/library/sqlite3.html#sqlite3-placeholders) as a practice against the risk of [SQL injection attacks](https://www.w3schools.com/sql/sql_injection.asp), and that you remember to `conn.commit()` the changes.

\<!-- We will use Python to connect to SQLite and create a database. \[Here is an example]\(https://colab.research.google.com/drive/19ts1DtmcWnSV3dlEyVz0zLfHrQv4IDkh) of the process if you need, but try it yourself first. -->

## Epic 4: Perform some queries

After you've populated your database, the priority is to solve all the business questions using SQL queries. If you like, you can still display your result in a Pandas DataFrame:

```python
conn = sqlite3.connect("pets.db")
cur = conn.cursor()

select_older_pets = """
   SELECT name, age, animal FROM Pets WHERE age > 10
"""

cur.execute(select_older_pets)
rows = cur.fetchall()

older_pets_df = pd.DataFrame(rows, columns=["name", "age", "animal"])

cur.close()
conn.close()
```

![example df result](staticAsset/data/Module-2/Project-5/older_pets.png "example df result")

Use SQL to answer the following questions:

1. What is the category generating the maximum sales revenue?
   * What about the profit in this category?
   * Are they making a loss in any categories or subcategories?
2. What are 5 states generating the maximum and minimum sales revenue?
3. What are the 3 products in each product segment with the highest sales?
   * Are they the 3 most profitable products as well?
4. What are the 3 best-seller products in each product segment? (Quantity-wise)
5. What are the top 3 worst-selling products in every category? (Quantity-wise)
6. How many unique customers per month are there for the year 2016.
   (_There's a catch here: contrary to other 'heavier' RDBMS, SQLite does not support the functions YEAR() or MONTH() to extract the year or the month in a date. You will have to create two new columns: year and month._)

\<!-- \[Here is an example]\(https://colab.research.google.com/drive/17bj8p6z52srkT13IEhCxBYS3JCNNgkYL) of how a database connection and query could look. -->
