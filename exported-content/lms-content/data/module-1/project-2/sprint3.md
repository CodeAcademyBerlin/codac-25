---
title: Sprint3
---


## Epic 1: Intro to Machine Learning

The idea of sentient machines is not something that only recently sprung into existence. Ancient Greek mythology has lore that imagines machines and inventions with intelligence and self-awareness.

Computers started evolving with the invention of the Analytical Engine by Babbage in 1837, and the first computer program was written by Ada Lovelace in 1842. People started wondering very early on if computers or machines could ever think for themselves. Renowned computer scientist, Alan Turing, was highly influential in the evolution of theoretical computer science, algorithms, and formal language, and he addressed concepts like artificial intelligence and machine learning as early as the 1950s. But while the concept itself is not new, we are currently experiencing an explosion of progress in the field of AI.

With faster computers, better processing, better computation power, and more storage, we have been living in what can be referred to as the Age of Data.

Data is used to solve real-world problems via machine learning algorithms, techniques, and methodologies. "Machine learning" is a broad umbrella term, two methods we will focus on are:

* Supervised learning
* Unsupervised learning

During the program, we will mostly cover Supervised Machine Learning methods, and your first project will be a **classification task**.

You can dig deeper into Machine Learning concepts and different algorithms in the [Machine Learning Fundamentals chapter](https://lms.codeacademyberlin.com/content/data/Machine-Learning-Fundamentals). It is not necessary to read everything now. As we refer to new ideas, you can go to that chapter and read about them.

## Epic 2: Preparing your Data

Machine learning is a fascinating area, currently in very high demand across all industries because of its versatility to solve a wide range of challenges. Its multiple applications include:

* Optimizing internal processes
* Predicting credit card fraud
* Identifying skin cancer
* Forecasting demand of products
* Managing air traffic, and many others

Although ML is not the solution to all our problems (one of the main challenges is knowing _when_ to use ML), its application is extensive.

Implementing a successful ML project requires several steps. The workflow is continuous: you either need to improve the model, or retrain it with fresh data when you reach the last stage. It's a wash-rinse-repeat process.

It is also not linear, meaning that sometimes you may have to revisit a previous step in order to fix or modify something before continuing.

**This guide is for classification problems. Some methods and metrics for regression and prediction problems may vary.**

Please be aware that this guide is by no means exhaustive, nor the only way to go about the process. If you research online or refer to a book, you will find that the order of the steps differ, or that there are even additional or fewer stages. There is a myriad of ways in which you can approach a project. We encourage you to research, read other peoples' code, and discover different methods of implementation.

You've already performed the two first steps of the ML workflow: collect and wrangle the data and the Exploratory Data Analysis (EDA). Here's a brief review:

### Collect your data

Throughout this course, we will provide you with the data sets. But in real life, you might find yourself in a situation where you have to retrieve the data yourself. Before you proceed, it is crucial to understand the questions that needs to be answered, as this will indicate where you have to collect the data:

* What kind of problem are you trying to solve?
* What data sources exist inside or outside your company?
* Is the data readily available in the different databases of your company (sales, customer service, website analytics, HR, shipping and delivery, etc.)?
* Is it public? Do you need to retrieve it from public sources, like government websites and publications?
* Do you need to buy data to answer these questions?
* Maybe you need to scrape your competition's website?
* Are there any privacy concerns with the data you are using?

After you've uploaded your data and converted it into a DataFrame, display the first rows with the `.head()` method to overview your features and the data, and check for inconsistencies.

#### Upload:

* Did the data upload correctly?
* The default delimiter of csv files is a comma ( , ) but it may happen that when the data was captured, they used a different delimiter. You will need to specify which delimiter to use to display the data correctly.

#### Labels:

* Are labels consistent? (underscore, spaces between words, capitalization)
* Are there spelling mistakes?

### Wrangle your data

Wrangling the data is a series of processes designed to transform raw data into usable data by cleaning, structuring and enriching it for analysis. The goal of this step is to increase the data quality. You will proceed to act upon the observations you made on the previous step.

#### Data structuring:

* Find the number of rows and columns with the `.shape()` method.
* Are there columns that you would merge or split? For example, separate first name and last name into two different columns.
* Merge data sets.

#### Data cleaning:

* Handle missing values by dropping, imputing or flagging them.
* Drop duplicates.
* Drop unnecessary information (drop highly correlated features and drop features that do not help in the prediction).
* Standardize formats and input ranges (convert all measures to the same format, e.g. Celsius instead of Fahrenheit.)
* Change datatype (make sure that numbers are integers or floats rather than strings, dates are of type date, etc.)
* Correct misspellings.
* Remove outliers.

An example of a technique used to remove outliers is to use IQR scores (Interquartile Range Scores), following the [IQR Rule](https://www.thoughtco.com/what-is-the-interquartile-range-rule-3126244#:~:text=Using%20the%20Interquartile%20Rule%20to%20Find%20Outliers\&text=Multiply%20the%20interquartile%20range%20\(IQR,IQR\)%20from%20the%20first%20quartile.).

#### Data enriching:

* Feature engineering (adding new features.) For example, if you have sales data with columns for the price of a unit and the number of units bought, you can add a column with the total, where `total = price * quantity`.

Always write down the steps you have taken and your observations. You will soon have to decide what to do with them.

You should already familiar with these operations as you applied a few of these processes to the wine datasets. Since this is our first project, the data sets were well-structured and clean, however in later projects, you will have to deepen your knowledge of the data wrangling process.

Albeit tedious, data scientists estimate that data wrangling takes 40% to 80% of their time.

### Explore your data

As the name suggests, during the Exploratory Data Analysis (EDA), you will explore data sets and summarize their main characteristics. Use statistical and data visualization methods to help you discover relationships between the different features, understand patterns, interpret the information, and achieve insights. It is during the EDA that you accept or reject your hypothesis.

#### Know your data:

Before you start working on your machine learning project, you need to understand your data set. In the LMS, we provided the descriptions of the features of the red and white wine data sets, but this is not always the case, and sometimes you have to figure them out yourself.

#### Review the statistical summary:

As you know, `.describe()` generates a summary of descriptive statistics (count, mean, standard deviation, maximum and minimum values, percentiles) for numeric values, excluding NaN values, and presents them in the form of a table.

Write down some of your findings; you will revisit them later.

#### Perform univariate and multivariate analysis with visualizations:

Tables filled with numbers can be challenging to understand, visualizations make our findings more palatable. Plots and charts allow you communicate powerful insights at a glance.

##### Univariate analysis

First, you will perform univariate analysis, which means you will evaluate _each variable independently_. For example, in Sprint 1, you created several plots to analyze and compare the distribution of the data points of the "quality\_label" feature, and in Sprint 2, you reviewed the residual sugar content in wine.

Histograms and box plots are commonly used for that type of analysis. With practice, histograms are one of the best ways to quickly learn a lot about your data, including central tendency, spread, modality, shape and outliers. On the other hand, box plots show robust measures of location and spread and provide information about symmetry and outliers.

##### Multivariate analysis

Multivariate analysis helps you map and understand interactions between _two or more variables_ in the data. It involves checking out distributions and potential relationships, patterns, and correlations between attributes.

Density and scatter plots are good ways to visualize these relationships. Scatter plots help understand the relationship between continuous, numeric variables.

#### Create a correlation matrix:

Analyzing features with a correlation matrix is the fastest way to develop a general understanding of their relationships. Correlation is a measurement that describes the relationship between two values, and a correlation matrix is a table that shows the correlation coefficients between many values.

Correlation is measured from -1 to +1. A simple way of visualizing these correlations is through a heatmap.

Some tips for reading a heatmap:

* A value of 1 means that both features move in the same direction (robust direct linear relationship).
* A value of 0 means that the features are not correlated (no linear relationship).
* A value of -1 means the features move in opposite directions (strong inverse linear relationship).
* Look out for the features that are not correlated with each other but **with the target**.
* Collinearity between features is often insightful because it may uncover surprising relationships.
* If you spot strongly correlated features, you can pick one and drop it to avoid "feature leakage". Usually, a value of 0.9 is a reasonable threshold.

#### Calculate Analysis of Variance (ANOVA):

ANOVA is a statistical method used to determine whether two or more data samples have a significant difference. Moreover, ANOVA is used when one variable is numeric and the other categorical, because it calculates the variance between samples and within samples.

Examples of when you might want to test different groups include:

* A group of psychiatric patients are trying three different therapies: counselling, medication and biofeedback. You want to see if one type of therapy yields better results than the others.
* A manufacturer has two different processes to make light bulbs. You want to compare them.
* Students from different colleges take the same exam. You want to see if one college outperforms the other.

Taking the last example case, usually, you would make two hypotheses:

* **Null Hypothesis:** There is NO significant difference between the average score of the students for the exam between colleges.
* **Alternative Hypothesis:** There IS a statistical difference between the average score of the students for the exam between colleges.

The ANOVA test gives us two measures as a result:

* **F-test score:** It calculates the variation between sample group means divided by variation within the sample group.
* **P-value:** It shows us the confidence degree. In other words, it tells us whether the obtained result is statistically significant or not.

With a p-value _above 0.05_ (95% confidence level), we cannot conclude that a significant difference in performance of students between colleges exists, and therefore cannot reject our null hypothesis.

If the value is _below 0.05_, there is a statistically significant difference between the students of the two colleges, and therefore we can reject the null hypothesis in favor of our alternative hypothesis.

There are two kinds of ANOVA tests:

* **One-Way ANOVA:** you are testing if there is a difference between samples considering only _one_ independent (categorical) variable that affects the dependent (continuous) variable.
* **Two-Ways ANOVA test:** you are testing if there is a difference between samples considering _two_ independent variables that affect the dependent variable.

[SciPy](https://docs.scipy.org/doc/scipy/) is a Python package with a built-in function to calculate ANOVA. For the sake of this programme, we will only be working with the **one-way ANOVA test**.

In machine learning, you can use the results of this test for feature selection, where you can remove those features independent of the target feature from the dataset. For example, your wine data set has eleven numeric features and one categorical feature. The results of the ANOVA test will let you know.

#### Calculate skewness and kurtosis:

Two helpful univariate descriptors are skewness and kurtosis. Skewness measures asymmetry in the data distribution, while kurtosis measures _peakedness_. Use them for quantitative data.

The skewness reflects the shape and distribution of the data. As you will see later on, asymmetrical data (with negative or positive skewness) may negatively influence your machine learning model. Therefore, you will have to use data transformation tools to normalize the distribution artificially.

```python
print(df['total_bill'].astype(float).skew())
```

Kurtosis identifies outliers: data with high kurtosis (heavy-tailed data) is proof of outliers, and data with low kurtosis (light-tailed data) lacks them.

```python
print(df['total_bill'].astype(float).kurt())
```

Both these measures will be helpful when you're preparing your data to implement an ML model.

## Epic 3: Predictive Modeling

Data preprocessing refers to preparing raw data for building and training machine learning models. This preparation entails several steps and is essential to enhance the quality of the data and extract meaningful insights from it.

For some of the steps that follow, you will use the Scikit-learn library, in particular the [sklearn.preprocessing package](https://scikit-learn.org/stable/modules/preprocessing.html), to transform raw features into a representation that is more suitable for ML models.

Follow all steps to first predict the type of wine (red or white), and then repeat them to predict the quality (low, medium, high, or however you have labeled your wines).

### Encoding Categorical Variables

Machine learning models cannot handle categorical data, meaning that to make categorical data useful, you will be required to encode the data or transform it into numerical values.
There are several techniques to encode your data, and using one over the other depends on several factors, for example:

_a. Is your variable nominal or ordinal?:_

* **Nominal variable:** the values have no relationship between them. For example, if we represent a list of countries with a number, the number won't have any 'weight', meaning that no country is more important than the other.
* **Ordinal variable:** This variable has an order or rank associated with it, like the "low", "medium", and "high" quality labels of your win data set.

_b. Is the variable that you're trying to encode the target or a feature?:_

* **One-Hot Encoding:** One-Hot Encoding converts each category value into a new column and assigns a 1 or 0 (True/False) value to the corresponding column. This encoding technique prevents the model from weighting a value improperly.
  For example, to one-hot-encode the wine-type, you would have a column for "type\_white" and a column for "type\_red". When the wine is red, "type\_red" will be 1 (true), while "type\_white" will be 0 (false). These categories are **nominal**.
* **Label Encoding:** Contrary to the One-Hot Encoding, Label Encoding is not binary but converts every categorical value to a number. Use it to encode ordinal data. According to the [documentation](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.LabelEncoder.html), you should use the Label Encoder for the target value y.
* **Ordinal Encoding:** Ordinal Encoding is similar to LabelEncoder, but you use it for **input values that can be ranked**.
* **Label Binarizer:** use the Label Binarizer for target value y in nominal categories.

**tip:** You will need to use the Label Encoder for the _wine type_ and the Ordinal Encoder for the _quality label_.

### Split your Data

Now that you've encoded your categorical values, we can proceed to the next step, which is splitting our data set into "train" and "test" groups. You will be using Scikit-learn's [train\_test\_split function](https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.train_test_split.html?highlight=train%20test%20split#).
The purpose of this split is to use a majority portion of the data to **train** the model, while the rest is reserved to **test** the model's performance.

```python
X = df # --> the features we will keep to build our model
y = target # --> what you're trying to predict

# Example:
y = X.SalePrice
X.drop(['SalePrice'], axis=1, inplace=True)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

Another more advanced and precise technique is to split your data into three parts, especially when comparing several models: train, validation, and test groups.
The article ["What is the Difference Between Test and Validation Datasets?"](https://machinelearningmastery.com/difference-test-validation-datasets/) by Jason Brownlee describes each group as follows:

* **Training dataset:** The sample of data used to fit the model.
* **Validation dataset:** The sample of data used to provide an unbiased evaluation of a model fit on the training dataset, while tuning model hyper-parameters.
* **Test dataset:** The sample of data used to provide an unbiased evaluation of a final model fit on the training dataset.

Scikit-learn still doesn't have a way to create these three groups automatically. The train\_test\_split function only splits the data set into two: training and testing data.

For now, you can simply split your dataset into 2 (train and test).

### Perform Feature Scaling

Feature scaling transforms the values of numeric columns in the dataset to a common scale. Without distorting differences in the ranges of values, this prevents the model giving more importance to one feature over the other. For example, if your data contains the variables of age and hair follicle density, the ranges can go from 0 to 100 and from 0 to a hundred thousand.

There are two ways of approaching this challenge: normalization and standardization.

**Normalization** rescales the values into a range of \[ 0, 1 ]:

* **MinMaxScaler:** This estimator scales and translates each feature individually from the original range so that all values are between 0 and 1. It is susceptible to the presence of outliers.

**Standardization** typically rescales data with a mean of 0 and a standard deviation of 1 (unit variance). The most common scalers are:

* **StandardScaler:** It shrinks the range of the feature values. However, this scaler doesn't work correctly in the presence of outliers.
* **RobustScaler:** If your data set contains outliers, this scaler is more appropriate because it works with the 1st and 3rd quantiles and not the mean and variance scaling.

If you're wondering whether to normalize or standardize your data, you can determine the best approach by how the data is distributed:

* Use **normalisation** techniques when you know that the distribution of your **data is skewed**.
* On the other hand, **standardisation** can be helpful in cases where the data follows a Gaussian (normal) distribution. Also, outliers will not be affected by standardization.

One common misconception is that feature scaling should be done **before** the split. It is actually better practice to do it individually on the train and test sets in order to avoid data leakage. Data leakage is where the modal can be influenced by data not meant to be included in its training. Scaling your data _before_ splitting means that the average and variance values will be calculated from the whole dataset, giving the modal access to data it should never have seen.

After defining which scaler best suits your needs, it's time to implement it to your data:

```python
# data normalisation with sklearn
from sklearn.preprocessing import MinMaxScaler

# fit scaler on training data
norm = MinMaxScaler().fit(X_train)

# transform training data
X_train_norm = norm.transform(X_train)

# transform testing data
X_test_norm = norm.transform(X_test)
```

Your data is now ready to be used in a Machine Learning algorithm!

## Additional Reading & Resources

* [How Much Data Is Created Every Day?](https://seedscientific.com/how-much-data-is-created-every-day/)
* [A basic introduction to Machine Learning](https://jakevdp.github.io/PythonDataScienceHandbook/05.01-what-is-machine-learning.html)
* [Cleaning Up Data From Outliers](https://www.pluralsight.com/guides/cleaning-up-data-from-outliers)
* [Understanding Skewness in Data and Its Impact on Data Analysis](https://www.analyticsvidhya.com/blog/2020/07/what-is-skewness-statistics/).
* [Transforming the prediction target](https://scikit-learn.org/stable/modules/preprocessing_targets.html#preprocessing-targets).
* [Feature Scaling for Machine Learning: Understanding the Difference Between Normalization vs Standardization](https://www.analyticsvidhya.com/blog/2020/04/feature-scaling-machine-learning-normalization-standardization/)
