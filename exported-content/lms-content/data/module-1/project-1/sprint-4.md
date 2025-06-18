---
title: Sprint 4
---


## Epic 1: The 5 steps of Data Analysis

Analyzing a dataset always involves several steps:

1. **Ask the right questions:** The first step towards any sort of data analysis is to ask the right question(s) from the given data. Identify the objective of the analysis, and it becomes easier to decide on the type(s) of data we will need in order to draw conclusions.
2. **Data Wrangling:** Data wrangling, sometimes referred to as data munging, or data pre-processing, is the process of gathering, assessing, and cleaning "raw" data into a form suitable for analysis.
3. **Exploratory Data Analysis (EDA):** Once the data is collected, cleaned, and processed, it is ready for analysis. As you manipulate data, you may find you have the exact information you need, or you might need to collect more data. During this phase, you can use data analysis tools and software which will help you to understand, interpret, and derive conclusions based on the requirements.
4. **Conclusion:** After the analysis phase is complete, the next step is to interpret our analysis and draw conclusions from it. As we interpret the data, there are 3 key questions we should be asking:
   * Did the analysis answer my original question?
   * Was there any limitation in my analysis which would affect my conclusions?
   * Was the analysis sufficient to help decision making?
5. **Communicating results:** now that the data has been explored and conclusions have been drawn, it's time to communicate your findings. This could be a small-scale meeting with the concerned people, or a large-scale project employing data storytelling, writing blogs, making presentations, or filing reports. The importance of great communication skills can never be overstated!

Note that the five steps of data analysis are rarely performed linearly. As your data opens up to you, you will often need to return to earlier steps to refine your data, or your questions, with fresh context.

Suppose you have done your analysis, drawn conclusions, then suddenly you find the possibility of representing a feature in a better way, or to construct a new feature out of other features present in the data set. In this case, you would go back to step 3, perform feature engineering, and the repeat the EDA with the new features added.

## Epic 2: Data Wrangling

Today, with the help of a new Python library called Pandas, you will focus on performing the second step: data wrangling.

Data wrangling has 3 sub-process:

* **Gather data:** collect the necessary data required to draw appropriate conclusions.
* **Assess data:** after the data has been gathered, stored in a supported format, and assigned to a variable in Python, it's time to gain some high-level overview of the type of data we are dealing with.
* **Clean data:** data cleaning is the process of detecting and correcting missing, or inaccurate, records from a "raw" data set. Since no two data sets are the same, the methods to tackle missing and inaccurate values vary greatly between data sets. Most of the time, however, we either fill the missing values, remove samples with missing values, or remove the feature which cannot be worked upon.

Install [Pandas](https://anaconda.org/anaconda/pandas) in your Conda environment.

Gathering the data has already been done for you. We will use the same movie dataset that you explored in your first days (with a few minor updates). Please download it again here: [movies\_2.csv](https://drive.google.com/file/d/1yFtA1E_kPkcMjKwwQafV0h3YsRig122S/view?usp=sharing).

Get familiar with some basic concepts of Pandas [here](https://drive.google.com/file/d/1LegiAniq3boQuEvjdozA0AVw1CBh_O1E/view?usp=sharing), and refer to the official Pandas documentation [here](https://pandas.pydata.org/docs/).

Now let's start to explore the concepts of data wrangling on the provided dataset.

```python
import pandas as pd

movies_df = pd.read_csv('movies_2.csv') # Gathering data
movies_df.head()
```

### Assessing Data

After you have completed all the steps above, you should be able to see the movies dataset in the form of a table.

It is now time to assess the data. This process provides information such as:

* the number of rows and columns present in the data set (i.e. the [shape](https://pandas.pydata.org/pandas-docs/version/0.23/generated/pandas.DataFrame.shape.html) of the DataFrame)
* columns present in the data set, along with the data type (use [info](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.info.html) or [dtypes](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.dtypes.html) method)
* check how many [NaN](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.isna.html) we have for MPAA Rating, Budget, Gross, Release Date, Genre, Runtime, Rating and Rating Count columns
* understand which kind of information each column represents

Please try to understand all these things using Pandas methods.

## Epic 3: Data Cleaning

Data analysts report spending roughly 70% of their time cleaning data. There are several methods to clean your dataset, but they will always depend on the original question.

As mentioned, exploratory data analysis (EDA) is where you start exploring your data with the help of charts and plots. We will not go too deep during this assignment as it requires you to use other Python libraries, but we will get there with the next project. For now we will just try to get information about this dataset without visual help.

### Manage Irrelevant data

Remove all irrelevant data in the dataset.

**Task**: Get rid of the Summary column (use the [drop()](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.drop.html) method)

### Standardize

Our duty is not only to recognize the typos, but to also standardize the formatting of the values. For strings, make sure all values are either in lower or upper case. For numerical values, make sure all values have a certain measurement unit. Height, for example, can be in meters and centimeters, or feet and inches.

In this case, it is recommended that column names have no space between words, but an underscore. Also, it is common to find column names written only in lowercase letters.

**Task**: use the [rename](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rename.html) method to change all column names to lowercase, and replace spaces with underscores if the name is made up of more than one word.

### Manage Missing values

Missing values are an unfortunate part of life, what do we do when we encounter them? Ignoring the missing data is like drilling holes in a boat: it will sink. Here are two potential ways to deal with them:

**Option 1: Drop**

If the missing values in a column rarely happen and occur at random, then the easiest and most forward solution is to _drop observations (rows)_ that have missing values. If most of the column's values are missing, and occur at random, then a typical decision is to _drop the whole column_. This is particularly useful when doing statistical analysis, since filling in the missing values may yield unexpected or biased results.

**Task**: Get rid of the last row, the one containing NaN for each column (use [drop()](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.drop.html) method and row index)

**Option 2: Impute**

This means to calculate the missing value based on other observations. There are quite a lot of methods:

* Use statistical values like **mean** and  **median**. However, none of these guarantee unbiased data, especially if there are many missing values.
  The mean is most useful when the original data is not skewed, while the median is more robust, not sensitive to outliers, and thus preferred when data is skewed.
  In a normally distributed dataset, one can get all the values that are within 2 standard deviations from the mean. Next, fill in the missing values by generating random numbers between `(mean — 2 * std) & (mean + 2 * std)`.
* Use a **linear regression**. Based on the existing data, one can calculate the best fit line between two variables. E.g. house price vs. size m².
* **Hot-deck**: copy values from other similar records, though this is only useful if you have enough available data. It can be applied to numerical and categorical data.
  One can take the random approach where we fill in the missing value with a random value. Taking this approach one step further, one can first divide the dataset into two groups (strata), based on some characteristic, say gender, and then fill in the missing values for different genders separately, at random.
* **Flag**: some argue that filling in the missing values leads to a loss of information, no matter what imputation method we used. That's because acknowledging that the data is missing is informative in itself, and the algorithm should know about it. Otherwise, we're just reinforcing the patterns that already exist.
  This is particularly important when the missing data doesn't happen at random. Take for example a conducted survey where most people from a specific race refuse to answer a certain question.
  Missing numeric data can be filled in with say, 0, but these zeros must be ignored when calculating any statistical value or plotting the distribution.
  Categorical data can be filled in with say, "Missing": a new category which communicates that this piece of data is missing.

**Things to take into consideration**: missing values are not the same as default values. For instance, zero can be interpreted as either missing or default, but not both. Missing values are not "unknown". A conducted research where some people didn't remember whether they have been bullied or not at the school, should be treated and labelled as unknown and not missing. Every time we drop or impute values we are potentially losing information. So, flagging might come to the rescue.

We are not going to create a Machine Learning model out of this dataset, therefore we could simply ignore the missing data for now. However, for the purpose of this exercise, we will handle missing data using the first approach.

Run the following code to see how many null values exist for the **Rating** column:

```python
movies_df["Rating"].isna().value_counts()
```

The following graph illustrates how the Rating column has a _negatively skewed_ distribution, so we suggest using the _median_ to replace the missing values for the Rating column.

![Rating Distribution](staticAsset/data/Module-1/Project-1/rating-distribution+.png "Rating Distribution")

**Task**: use the [fillna()](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.fillna.html) method to replace the missing values of Rating with their median value.

```python
movies_df.fillna({ 'rating': df['rating'].median() }, inplace=True)
```

The following graph illustrates how the **Rating Count** column is also skewed, use the same method to fill the missing values.

![Rating Count Distribution](staticAsset/data/Module-1/Project-1/rating-count-distribution+.png "Rating Count Distribution")

### Manage Duplicates

**Task**: [Drop the duplicates](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.drop_duplicates.html), if any.

### Type conversion

Make sure numbers are stored as numerical data types. A date should be stored as a date object, or a Unix timestamp (number of seconds), and so on.

**Task**: Convert Budget into integer type (use the [astype()](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.astype.html) method)

**Task**: Convert Gross into integer type

**Task**: Convert Release Date into date type (use the [to\_datetime](https://pandas.pydata.org/docs/reference/api/pandas.to_datetime.html) method)

### Syntax Errors

There are no syntax errors here, but it is something you should always check.

### Manage Outliers

Outliers are values that are significantly different from all other observations in the dataset. Any data value that lies more than `1.5 * IQR` away from the Q1 and Q3 quartiles is considered an outlier.

Outliers are innocent until proven guilty: they should not be removed unless there is a good reason.
Weird, suspicious values that are unlikely to happen could be data entry errors, and so you might decide to remove them. Though, it is always worth investigating before removing anything.

It is also worth mentioning that some machine learning models, like linear regression, are very sensitive to outliers. In other words, outliers might throw the model off from where most of the data lies.

**In-Record & Cross-Dataset Errors**

These errors result from having two or more values in the same row or across datasets that contradict.
For example, if we have a dataset about the cost of living in cities, the "total" column must be equivalent to `rent + transport + food`.

## EDA Exercises

Now we can start with the exploratory analysis. Answer the following questions:

1. Show the movies with more than 7 in **Rating** & greater than 50 million **Gross**
2. Show the movies with more than 7 in **Rating** & greater than 50 million **Gross** & **MPAA Rating** as PG
3. Show the **count** of **Animation** movies with more than 7 in **Rating** (use the `shape()` method)
4. Show the **top 5** movies based on **Budget**
5. Show the **top 5 Comedy** movies by **Rating**
6. **Top 5** movie names by **Rating**
7. **Top 3** high **Gross Romance** movies released **after 1999** (typecast it to datetime)
8. How many of each **Genre** are present in the DataFrame? (use `value_counts()` method which applies to Series, not DataFrame)
9. **Top 5** most expensive movies released **after 1999** (measured by **Budget**)
10. Most & least frequent **MPAA Rating** in the dataset in terms of occurrences
11. Most & least expensive **Genre** (take an average of all **Budget** measures grouped by Genre - use the `groupBy()` method)
12. Which **Genre** is most favoured?
