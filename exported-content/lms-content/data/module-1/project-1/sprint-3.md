---
title: Sprint 3
---


## Epic 1: Basics of Statistics

Data Science is an umbrella term, referring to many different concepts and technologies. Before you dive into the deep sea of data science, you must first familiarize yourself with some basic mathematics and statistics. Don't worry - we only need a basic understanding!

\<!-- There are important skills you need to develop and work on to become a successful data professional, for example:

Finding datasets: there are two ways to kickstart any data science project; you either have a dataset you want to use to build a project. Or you have an idea and need to find a dataset for. Exploring datasets and choosing the right one for your project is an important skill to obtain.

Initially, we will provide you with all the datasets.

Science communication: as a data person, you will need to communicate with a general audience to deliver your process and findings. So, you will need to develop your science communication skills and explain complex concepts using simple terms.

Effective visualization: the only way to validate your findings is to visualize them. Visualization plays a big role in data science, from exploring your data to delivering your results. Getting familiar with effective visualization of data can save you tons of time and effort during your project.

We discuss this as we progress in the course. -->

Data Analytics is incomplete without knowledge of probability and statistics; they are crucial to a Data Analyst's process for decision making and prediction. Statistical knowledge helps you choose appropriate methods to collect and manage data, and will guide you to a more correct analysis.

### About Statistics

**Statistics**, which is a branch of mathematics, is concerned with developing and studying methods for collection, analysis, interpretation and presentation of data.

With huge amounts of data being generated each day and increasing computation power, statistics has become a major tool for any business to predict the market and reshape their business model based on analysis of market sentiment and customer behavior.

Often, a statistic is used to measure the value of a population parameter. For instance, consider a random sample of 100 employees from an organization with 1000 employees. The average salary of the sampled employees will give a statistical summary of the whole organization.

**Uncertainty and Variation are key concepts in the field of Probability and Statistics.**

Uncertainty, as the name suggests, is where an outcome **can not be determined**. For example, based on performance in previous matches, a soccer team’s chance of winning can be estimated to be very _likely_, however, no-one can guarantee the outcome. Sometimes, uncertainty exists because of a lack of information. Suppose a candidate has been interviewed for a job offer however, they can not know whether they have passed the interview until the employer provides the official job offer letter or publishes the results.

**There are two major branches of statistics - Descriptive and Inferential.**

* **Descriptive statistics** helps to analyze data by describing or summarizing data in a meaningful way. It might look for patterns which can help to reach a conclusion about the data, however, it does not draw any conclusion beyond the data or about any hypotheses.
* **Inferential statistics** which provides techniques that can draw a small sample from a large population to make generalizations about that population and also perform hypothesis testing to determine relationships between two datasets.

_For example: the mean height of 100 students in a school is 150 cm. 100 students here represent a small sample from a large population of 2500 students in the school. This mean value is a parameter of descriptive statistics. However, no conclusion can be made about rest of the students just by looking at the sample students._

Now, to make generalizations of this population of 2500 students without measuring the height of each student, the task is to do proper **sampling** and choose 100 students such that the sample accurately represents the population. However, sampling naturally consists of sampling error and thus a sample can never be considered to be the _perfect_ representation of the whole population. For example, we could assume that all of the 2500 students are at least 135cm. But, if even one student is found to be less than 135cm tall, this conclusion is shown to be erroneous. So, the need is to have a conclusion within a certain degree of accuracy, e.g., in 80% of cases, the height of students falls above 135cm.

That is inferring correctness of a conclusion with a calculated measure of risk. This is referred to as Inferential Statistics.

## Descriptive Statistics

Descriptive statistics **describe, show or summarize data** so that meaningful insights can be extracted.

The parameters of descriptive statistics can be classifies into **4 categories**:

**Measures of Frequency (Count, Percent, Frequency)**

For example, in an electronics store, how many laptops are sold in a month? Or, what proportion of laptops sold in a month are MacBooks? Or, in a sale of 10 laptops, how many are MacBooks?

**Measures of Central Tendency (Mean, Median, Mode)**

![stat 1](staticAsset/data/Module-1/Project-1/stat-1+.png "stat 1")

**Mean** is the average. Calculate the mean by taking the sum of all data points (add all the values together!) and divide by the number of points. For example, in our electronics store, what is the average price of a Samsung laptop?

\<!-- $${\frac {\sum s}{n}} = \overline{x}$$ -->

\<!-- $${\frac {389 + 400 + 500 + 780 + 800 + 1000 + 1100 + 1200 + 1230}{9}} = 822.11$$ -->

`(389 + 400 + 500 + 780 + 800 + 1000 + 1100 + 1200 + 1230) / 9 = 822.11`

**Median** is the exact middle point when all data points have been arranged in order. If there are two middle points (in the case of an even number of data points), take the mean of those two numbers. For example, what is the price of the laptop model that divides Samsung laptops into two equal groups: high end models & low end models?

_389 | 400 | 500 | 780_ **| 800 |** _1000 | 1100 | 1200 | 1230_

**Mode** is the value that appears most often in the dataset. For example, which laptop model sold most often this year?

**Measures of Variation (Range, Variance, Standard Deviation)**

**Range** measures the difference between the lowest and the highest data point values. For example, what is the range of prices for Samsung laptops in the store?

`1230 - 389 = 841`

The parameters **variance** and **standard deviation** show the "spread" of the data by measuring the difference between observed score and the mean value.

Variance is calculated by subtracting the mean from each data point, squaring that value, then dividing the sum of all those values by the number of data points. **Important note**: if you are working from a **sample**, rather than a whole **population**, you will divide by the number of samples _minus one_ (if you want, read an article covering this concept [here](https://medium.com/p/89821b83ef6d#25da)).

`((389 - 822)² + (400 - 822)² + (500 - 822)² + (780 - 822)² + (800 - 822)² + (1000 - 822)² + (1100 - 822)² + (1200 - 822)² + (1230 - 822)²) / (9-1) ≈ 111227`

\<!-- Variance = ((389 - 822)^2 + (400 - 822)^2 + (500 - 822)^2 + (780 - 822)^2 + (800 - 822)^2 + (1000 - 822)^2 + (1100 - 822)^2 + (1200 - 822)^2 + (1230 - 822)^2) / (9-1) = 111227 (approx) -->

\<!-- $$
s^2={\frac {\sum (X - \ x)}{n - 1}}
$$

$$
s^2={\frac {\sum (X - \overline{x})}{n }}
$$

s² = sample variance
∑ = sum of...
X = each value
$\overline{x}$ = sample mean
n = number of values in the sample -->

Standard deviation is then the square root of the variance, converting the value back into the original units.

`√111227 ≈ 333`

**Measures of Relative Position (Percentile, Quartile)**

This describes how data points fall in relation to one another. Descriptive statistics would help to answer the following questions:

* What kind of distributions do the data points have?
* Does the dataset contain a wide range of values, or are there a lot of similar values?
* What value is in the center of the data points?
* Where does a particular value stand with respect to other values in the dataset?
* Is there any particular region where data points are more concentrated?
* With the collection of more and more data points, what is the change in overall distribution?

## Inferential Statistics

Inferential statistics takes a _random sample_ of data from a population and looks for patterns and insights to describe, and make inferences about, that population. To understand concepts of inferential statistics, you will have to be acquainted with the following terminologies:

### Confidence Interval

A **confidence interval** is a range of values within which we are fairly sure our value lies. The **confidence level** is a percentage estimate for how often we expect our sample value to fall within the confidence interval.

Statisticians and other analysts use confidence intervals to understand the statistical significance of their estimations, inferences, or predictions. Usually we use a confidence level of 95% or 99%: we calculate the interval within which, with repeated sampling of the same population, we would find the value 95% or 99% of the time.

Confidence _level_ is expressed as a percentage, while confidence _interval_ is a range of values.

For example, we measure the heights of 240 randomly chosen men and we find out that the mean height is 175cm. We also know that the standard deviation is 30cm.

We decide that we want to calculate the confidence interval with a confidence level of 95%.

We can use [this great calculator](https://www.mathsisfun.com/data/confidence-interval-calculator.html) to find that the confidence interval is 171cm to 179cm. This means that if we would take another random sample of men, their height would fall between these two values 95% of the time.

\<!-- (168.8cm, 181.2cm) where did these numbers come from? -->

Try to use a smaller confidence level and see what happens to the confidence interval! Then try with a higher confidence level.

### Hypothesis Testing

A **hypothesis** can be defined as an _educated guess_ about any topic. However, you must be able to test your hypothesis by conducting experiments or making observations. The following format is one of the most widely used ways to describe a hypothesis statement:

**If (change in independent variable), then (change in dependent variable).**

Examples:

1. If (students are more exposed to a "learning by doing" methodology) then (increase in student engagement in the subjects)
2. If (increase in the amount of water given to plants) then (increase in growth of the plants).

Now that we have 2 hypotheses, we must also define a **null hypothesis** for each.

A null hypothesis says there is no statistical significance between the two events in the hypothesis. Philosophically, it can be argued that a truth can never be proven, only disproven. We define a null hypothesis in order to have a "truth" that can be rejected, so that our alternative hypothesis may be accepted (until more data can be gathered for further testing.)

The null hypothesis for the examples above could be:

1. There is no correlation between "learning by doing" methodologies and student engagement
2. There is no correlation between water and plant growth

Now, the task is to challenge the null hypothesis. If we can disprove it, then we have also demonstrated that our alternate hypothesis is well founded.

The alternative hypotheses would state something like the following:

1. The "learning by doing" methodology encourages higher engagement.
2. The more water given to plants, the greater the growth of the plants.

Rejecting or accepting the null hypothesis would requires demonstrating statistical significance, which can be achieved using a variety of tests. The **p-value** (essentially a measure of probability that the null hypotheses is true) can be used to determine the statistical significance of the results.

**A p-value that is less than or equal to 0.05 usually indicates that there is strong evidence against the null hypothesis.**

If we were to conduct a test, we will probably find that the p-value is indeed _smaller_ for the first hypothesis (learning by doing DOES bring higher engagement) and for the second it is _higher_ (the amount of water is NOT directly related to the growth of plants).

In the next project, you will perform hypothesis testing and all these concepts will become more clear. For now it's just important to remember that every statement you make needs to be statistically valid to be taken into consideration.

## Exercises

Now it's time to solve some problems. Many of these problems can be solved both by hand (or by observation) and by using a Python library called Numpy. We encourage you to first try to understand the solution by observing (or calculating) manually, then confirm your results by using Numpy.

A library is a collection of modules. You can think of packages as the directories on a file system and modules as files within directories. A module is a file consisting of Python code that performs a specific task. Therefore, a module is similar to a function that allows you to perform many actions without writing your own code.

To install Numpy on your conda virtual environment, use the Anaconda Navigator, or follow [this documentation](https://anaconda.org/anaconda/numpy).

**Hint:** The line of code that you will find in the link needs to be pasted into the Anaconda Prompt!

**Exercise 1**

There are 5 numbers in the data set: (8, 12, 16, 24, 4).

* What is the mean?
* What will be the sum of deviations of individual data points from their mean?
* What is the standard deviation?

**Exercise 2**

If some outliers are introduced to the dataset from exercise 1, what will happen to the Standard Deviation? Will it increase, decrease or remain the same?

**Exercise 3 (no Numpy)**

Suppose the following positively skewed distribution has a median of 30, which one of the following statements is true?

A) Mean is greater than 30\
B) Mean is less than 30\
C) Mode is greater than 30\
D) Mode is less than 30\
E) Both A and D\
F) Both B and C

![stat 2](staticAsset/data/Module-1/Project-1/stat-2.jpg "stat 2")

**Exercise 4**

What could be a possible median value for the following data distribution?

![stat 3](staticAsset/data/Module-1/Project-1/stat-3+.png "stat 3")

Assume the data is distributed as follows, and calculate the median using code:

```python
[10, 10, 10, 10, 11, 11, 12, 13, 14 ]
[15, 15, 15, 16, 16, 16, 16, 16, 17, 18, 19, 19]
[20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 23, 23, 23, 24, 24, 24]
[26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 29, 29, 29, 29, 29, 29, 29, 29, 29]
[30, 30, 30, 30, 30, 31, 31, 32, 32, 33, 33, 34, 34]
[35, 35, 35, 37, 37, 37, 37, 39, 39, 39]
[40, 40, 43, 43, 44, 44]
[46, 46, 46, 47, 49]
[52, 53, 54]
```

**Exercise 5**

Given the following distribution, what is the shape of the distribution? (no Numpy):

![stat 4](staticAsset/data/Module-1/Project-1/stat-4+.png "stat 4")

**Exercise 6**

Which measure of central tendency (mean, median, or mode) best represents the center of the data from exercise 5, and why?

**Exercise 7**

From the same data: if the Y-axis represents the number of individuals, and the X-axis represents the salary of the individual in thousands, how many individuals have a salary less than 10 thousand? (no Numpy)

**Exercise 8**

We have a set of positive numbers. If a single value of the set is altered, what must change?

A) Mean\
B) Median\
C) Mode\
D) All of these

**Hint**: try to create a Numpy array and calculate mean median and mode, then alter it and see what changes.

**Exercise 9**

The following chart shows hourly consultancy rates of 10 employees. Calculate the standard deviation of the rates from the 10 employees.

![stat 5](staticAsset/data/Module-1/Project-1/stat-5+.png "stat 5")

**Exercise 10 (no Numpy)**

Which of the following random variables is discrete?

A) the length of time a battery lasts\
B) the number of pens purchased by a student in a year\
C) the percentage of cows in a cattle firm that have been vaccinated\
D) the distance between a pair of towns

**Exercise 11 (no Numpy)**

Which of the following normal distributions will have the greatest spread?

A) mu = 5, sigma = 1.5\
B) mu = 10, sigma = 1.0\
C) mu = 5, sigma = 1.65\
D) mu = 8, sigma = 1.2\
E) mu = 10, sigma = 1.6

#### Other Exercises:

Get familiar with the basic concepts of Numpy with [this great tutorial](https://cs231n.github.io/python-numpy-tutorial/#numpy).

Only attempt if you have solved all the previous LMS exercises: [list of 100 Numpy exercises](https://github.com/rougier/numpy-100/blob/master/100_Numpy_exercises.md).
