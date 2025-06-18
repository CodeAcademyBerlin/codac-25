---
title: Sprint 1
---


## Epic 1: Understanding the Data

Before you start loading in the data, it might be a good idea to check how much you really know about wine and its composition.

There are several varieties of wine, however, as per the business, this analysis will be limited to red and white wine distinction.

Download the datasets [here](https://archive.ics.uci.edu/ml/datasets/wine+quality).

There are 3 data files:

* the file named **winequality-red.csv** contains 1599 records of red wine samples
* the file named **winequality-white.csv** contains 4898 records of white wine samples
* the file named **winequality.names** consists of detailed information and the data dictionary pertaining to the datasets

These datasets include a mix of chemical and sensory variables — let’s break down what they mean:

* **Fixed acidity:** acids are major wine properties and contribute greatly to a wine’s taste. Usually, the total acidity is divided into two groups: the volatile acids and the non-volatile or fixed acids. Fixed acids found in wine include: tartaric, malic, citric, and succinic. This variable is expressed in **g(tartaricacid)/dm3** in the datasets.
* **Volatile acidity:** essentially the process of wine turning into vinegar. In the U.S, the legal limits of Volatile Acidity are 1.2 g/L for red table wine and 1.1 g/L for white table wine. In these datasets, the volatile acidity is expressed in **g(aceticacid)/dm3**.
* **Citric acid** is one of the fixed acids that you’ll find in wines. It’s expressed in **g/dm3** in the two data sets.
* **Residual sugar** typically refers to the sugar remaining after fermentation stops. It’s expressed in **g/dm3** in the datasets.
* **Chlorides** can be a significant contributor to saltiness in wine. Here, it’s expressed in **g(sodiumchloride)/dm3**.
* **Free sulfur dioxide:** free sulfur dioxide becomes "bound" when it protects against oxidation and spoilage in wine, but remains permanently present afterward. Winemakers try to have the highest proportion of free sulfur to bind. This variable is expressed in **mg/dm3** in the data.
* **Total sulfur dioxide** is the sum of the bound and the free sulfur dioxide (SO2). Here, it’s expressed in **mg/dm3**. There are legal limits for sulfur levels in wines: in the EU, red wines can only have 160mg/L, while white and rose wines can have about 210mg/L. Sweet wines are allowed to have 400mg/L. Legal limits are set at 350mg/L for the USA, and 250mg/L for Australia.
* **Density** is generally used as a measure of the conversion of sugar to alcohol (sugar concentration). Here, it’s expressed in **g/cm3**.
* **pH** or the potential of hydrogen is a numeric scale to **specify the acidity or basicity** the wine. As you might know, solutions with a pH less than 7 are acidic, while solutions with a pH greater than 7 are basic. With a pH of 7, pure water is neutral. Most wines have a **pH between 2.9 and 3.9** and are therefore acidic.
* **Sulphates** are an additive that contribute to the sulfur dioxide levels. In this case, they are expressed in **g(potassiumsulphate)/dm3**.
* **Alcohol**: wine is an alcoholic beverage and, as you know, the percentage of alcohol can vary from wine to wine. It’s expressed in **% vol**.
* **Quality**: wine experts graded the wine quality **between 0 (very bad) and 10 (excellent)**. The final score is the mean of at least three evaluations. **Some analysts might combine these levels to Low, Medium & High-Quality wines**.

## Epic 2: Load the Data

Use the Pandas [read\_csv](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.read_csv.html) function to read the data, and load it into a DataFrame:

```python
red_wine = pd.read_csv('winequality-red.csv')
```

If you get any errors, or unusual data format, please check the **sep or delimiter argument**.

**DO NOT forget to import the necessary libraries.**

## Epic 3: Data Wrangling

Now let's start to explore the concepts of data wrangling on the provided dataset.

Let's start by assessing the data:

* print the first and last 10 records (use [head()](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.head.html) and [tail()](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.tail.html?highlight=tail#pandas.DataFrame.tail) methods)
* check the [info()](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.info.html) and the [shape()](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.shape.html)
* observe if there are missing values (use [isna()](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.isna.html) or [isnull()](https://pandas.pydata.org/docs/reference/api/pandas.isnull.html))
* check descriptive statistics for both red and white wine datasets (use the [describe()](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.describe.html) method)

Let's now group our qualities into 3 categories: low, medium and high quality wines. The following code block applies a lamda function to create a new column, categorizing the quality into three labels based on their quality rating. We then make sure to transform that column into a [Pandas Categorical](https://pandas.pydata.org/docs/user_guide/categorical.html) data type:

```python
# create new column
red_wine['quality_label'] = red_wine['quality'].apply(lambda value: 'low'
if value <= 5 else 'medium'
if value <= 7 else 'high')

# transform into categorical type
red_wine['quality_label'] = pd.Categorical(red_wine['quality_label'], categories=['low', 'medium', 'high'])
```

Do the same with the white wine.

Now we want to create a third dataset, in which we have both red and white wines [together](https://realpython.com/pandas-merge-join-and-concat/). It might be useful for more complex analysis and plots, and we will use it further on to create our first Machine Learning algorithm that will be able to predict the wine type based on its composition. **Tip**: add a column to define the "wine type" before merging the datasets.

You should now have three DataFrames: `red_wine`, `white_wine`, and `all_wines`.

## Epic 4: Exploratory Analysis

Using the red\_wine and white\_wine datasets, create a table like the one below to compare Descriptive Statistics between red and white wines:

```python
pd.concat([red_wine.describe(), white_wine.describe()], axis=1, keys=["Red Wines Stats", "White Wines Stats"])
```

The code above will produce statistics for all features, however **notice that only a few columns have been taken into considerations in the image below.** Change your code accordingly.

![Stats comparison](staticAsset/data/Module-1/Project-2/stat_comp.jpg "Stats comparison")

You can observe that the mean value of sulphates and volatile acidity seem to be higher in red wine compared to white wine.

Come up with few more observations and write them down. This will help you understand which features are worth investigating further, keeping in mind that we are first trying to understand the difference between red and white wines, and then their respective relations with the quality label.

### Let's start plotting!

Use Matplotlib and Seaborn to explore relations between features.

The first plot you should do is a [pie chart](https://matplotlib.org/stable/gallery/pie_and_polar_charts/pie_features.html), showing the quantity of red wines compared to the quantity of white wines.

Now create a plot to show the distribution of qualities. It should look something like this:

![Wine quality barplot](staticAsset/data/Module-1/Project-2/wine-quality-barplot.png "Wine quality barplot")

Try using the [Seaborn histplot](https://seaborn.pydata.org/generated/seaborn.histplot.html). Make sure that both plots have the same order of categories in the X-Axis, and that they share the range on the Y-Axis.

Once you manage to create it, try playing around with the colors and titles.

Now let's compare the quality with some other features. For example, try reproducing the following box plot:

![Boxplot-compare-quality](staticAsset/data/Module-1/Project-2/boxplot-compare-quality.jpg "Boxplot-compare-quality")

Remember that for some features it makes sense to distinguish between white and red wines, for some others we can simply explore them together.

**Spend the rest of the week experimenting with charts and digging deeper into the data. Try different plot types, keep your visuals clear and uncluttered, and back up your insights with a bit of domain research when possible.**
