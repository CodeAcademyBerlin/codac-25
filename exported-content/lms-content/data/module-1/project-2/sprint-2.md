---
title: Sprint 2
---


## Epic 1: Univariate Analysis

This is perhaps one of the simplest core foundational steps in exploratory data analysis. Univariate analysis involves analyzing data in a way that you are only dealing with one variable or feature at a time - no relationships or correlations are acknowledged between variables. The simplest way to visualize all the variables in your data is to build some histograms.

The following snippet helps visualize distributions of data values for all features. While in many cases a histogram may not be the most appropriate visualization, it is still a good place to start for numeric data.

```python
red_wine.hist(bins=15, color='red', edgecolor='black', linewidth=1.0, xlabelsize=8, ylabelsize=8, grid=False)

plt.tight_layout(rect=(0, 0, 1.2, 1.2))
plt.suptitle('Red Wine Univariate Plots', x=0.65, y=1.25, fontsize=15)
```

It is important to note that we are using the [hist() method](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.hist.html) from Pandas. This function calls the Matplotlib `hist()` method on each Series in the DataFrame, resulting in one histogram per column. For more information, you can have a read of [this article](https://www.kaggle.com/residentmario/univariate-plotting-with-pandas).

Since we just want to look at the distribution, we don't really care now if the Y-Axes have different values for each histogram.

Try to do the same for white wine.

Libraries like Matplotlib and Pandas enable you to easily plot variable distributions. Do you notice any interesting patterns across the two wine types?

You can then choose single features and analyze them. For example, take the feature named "residual sugar" and plot the distributions for both red and white wine samples.

![Red white wine residual sugar comparison](staticAsset/data/Module-1/Project-2/residual-sugar-white-red-comparison.png "Red white wine residual sugar comparison")

Try to reproduce these [histograms](https://seaborn.pydata.org/generated/seaborn.histplot.html): include the title, the labels, and make sure the Y-axes have the same limit. **Also, notice how the values on the X-axes have been binned.**

**Hint:** title, labels and Y-Axis limit are all features of the [axes class](https://matplotlib.org/stable/api/axes_api.html)!

Do the same with other features to see if there are more interesting observations.

## Epic 2: Multivariate Analysis

In contrast to univariate analysis, multivariate analysis involves analyzing _multiple_ feature variables and their relationships. Check if there are any interesting patterns and relationships between the physicochemical attributes of our wine samples; this could be helpful in the future for your machine learning process.

One of the best ways to analyze features is to build a pairwise correlation plot depicting the correlation coefficient between each pair of features in the dataset.

This is an example of how your heatmap could look:

![Wines heatmap](staticAsset/data/Module-1/Project-2/heatmap-sns.png "Wines heatmap")

You can follow [this example](https://towardsdatascience.com/better-heatmaps-and-correlation-matrix-plots-in-python-41445d0f2bec) to create something similar. If you need to, you can increase the plot size using `plt.figure(figsize=(15,8))`.

\<!-- In the example there are 3 variables: \_vegetables, farmers and harvest.\_

\_Vegetables\_ and \_farmers\_ are the strings that will go on the x and y axis. In our case, these are the same and correspond to the column names in our dataset (but only of the numeric values).

So the first step is to select from our dataframe the column names of only numeric values (use google to search how you can do it).

The \_harvest\_ variable is a numpy array containing the numeric values. You can use \[this Pandas method corr()]\(https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.corr.html) to compute pairwise correlation of columns, and then the \[to\_numpy()]\(https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to\_numpy.html) method to transform the resulting dataframe into a numpy array.

Once you have all the necessary variables, use the code in the example, change the appropriate parameters, and run the cell.

Note that:

\- the plot is too small (use \[set\_figheight() and set\_fighwidth()]\(https://matplotlib.org/stable/api/figure\_api.html?highlight=fig#module-matplotlib.figure#set\_figheight) to increase the size of your heatmap)

\- our correlation numbers have more than 3 decimal numbers. Round the numbers of the NumPy array to 2 decimal numbers (use \[round() method]\(https://numpy.org/doc/stable/reference/generated/numpy.ndarray.round.html)) -->

You can use similar plots on other variables and features to discover more patterns and relationships. To observe relationships among features with a more detailed view, joint plots are excellent visualization tools specifically for bivariate visualizations. The following plot explores the relationship between sulphates and quality rating for red wine. We have combined one scatterplot and two histograms:

![Red Wines Joint plot](staticAsset/data/Module-1/Project-2/joint-plot.png "Red Wines Joint plot")

Try to follow [this example](https://seaborn.pydata.org/generated/seaborn.jointplot.html). Remember to add a title!

Once you've managed to recreate this joint plot, do the same for white wines.

What if you want to visualize a higher number of features and determine patterns from them? We can use a scatterplot with 3 variables, for example:

![Red Wines Scatterplot](staticAsset/data/Module-1/Project-2/scatter-sulphates-alcohol-quality.png "Red Wines Scatterplot")

\<!-- \`\`\`python
import matplotlib.patches as mpatches

colors = {"low": "khaki", "medium": "orange", "high": "navy"}

fig, ax = plt.subplots()
scatter = ax.scatter(red\_wine\["alcohol"], red\_wine\["sulphates"],
&#x20;          c=red\_wine\['quality\_label'].map(colors), alpha=0.5)
ax.set\_xlabel("alcohol", fontsize=10)
ax.set\_ylabel("sulphates", fontsize=10)
ax.set\_title('Red Wines - Sulphates, Alcohol and Quality')

low\_quality = mpatches.Patch(color='khaki', label='low')
medium\_quality = mpatches.Patch(color='orange', label='medium')
high\_quality = mpatches.Patch(color='navy', label='high')

ax.legend(handles=\[low\_quality, medium\_quality, high\_quality])

plt.show()
\`\`\` -->

\<!-- This is the code that produced it, first we define a dictionary where we associate a color to each quality\_label, then in the \`c\` (color) parameter of the scatterplot we map them (we associate each quality\_label in the dataset with the corresponding color), and for the legend we use a special matplotlib class called patches.  -->

[Here](https://seaborn.pydata.org/generated/seaborn.scatterplot.html) is an example of how to produce a scatterplot. Produce more scatterplots for both red and white wines where you explore 3 variables at the same time.

## Epic 3: Statistical Significance

In statistical hypothesis testing, statistical significance determines how likely inferences and propositions made about a data sample are to be true. The idea is to use statistical methods and models to calculate a significance level which, at specific breakpoints, either supports or contradicts our hypothesis. Every hypothesis should consist of a null hypothesis and an alternative hypothesis.

Before you move forward, it is a good idea to be clear about your hypothesis. If you want, read some more about defining a hypothesis statement [here](https://www.statisticshowto.com/probability-and-statistics/hypothesis-testing/#Hypothesis).

If the results of your statistical test is **statistically significant** (based on pre-set significance levels, e.g. if the obtained p-value is less than 5% significance level), you can reject the null hypothesis in favor of the alternative hypothesis.

Alternatively, if the result is _not_ statistically significant, you can conclude that the null hypothesis is correct.

A great statistical model used to prove or disprove the difference in mean between subsets of data is the **ANOVA** test.

ANOVA stands for "analysis of variance", and it is used to analyze statistically significant differences between means/averages of various groups by testing the level of equality. It can be used on several groups at once, but we will only be working with the **one-way ANOVA test**.

\<!-- \<youtube title="Puppet video" height="500px" src="-yQb\_ZJnFXw"/> -->

\<iframe style="aspect-ratio: 16/9; width: 90%" src="https://www.youtube.com/embed/-yQb\_ZJnFXw?si=glNGoi3Mn812F6uE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>\</iframe>

You can also read [this article](https://www.statisticshowto.com/probability-and-statistics/hypothesis-testing/anova/) for more details.

Once the concept is clear, let's ask ourselves some questions and test them.

**Hypothesis**: "The mean alcohol level varies significantly between low, medium, and high quality red wines."
**Null hypothesis**: "The mean level of alcohol is mostly consistent between low, medium, and high quality wines."

Install [SciPy](https://docs.scipy.org/doc/scipy/reference/stats.html), the most widely used Python library for statistical analysis, into the Conda environment for your project. Copy and run the following block of code, which implements a one-way ANOVA test for alcohol:

```python
from scipy import stats

F, p = stats.f_oneway(
    red_wine[red_wine['quality_label'] == 'low']['alcohol'],
    red_wine[red_wine['quality_label'] == 'medium']['alcohol'],
    red_wine[red_wine['quality_label'] == 'high']['alcohol']
)
print('ANOVA test for mean alcohol levels across wine samples with different quality ratings')
print('F Statistic:', F, '\tp-value:', p)
```

Check the output. The p-value is less than 0.05 in the first test. This tells us that there is a statistically significant difference in the mean alcohol level for at least two groups out of the three (hence, we can **reject the null hypothesis** in favor of the alternative).

As you probably remember from the previous sprint, the box plot for alcohol levels shows significant difference:

![Boxplot alcohol and quality](staticAsset/data/Module-1/Project-2/boxplot-alcohol-quality.jpg "Boxplot alcohol and quality")

Attempt to find statistical significance between other features. If you find something, save your results for the final project presentation.

## Epic 4: Prepare a preliminary presentation

Create a few slides with your findings (4-8 EDA slides). This is a preliminary presentation for you to get familiar with talking in front of an audience. The focus of this presentation should be on domain knowledge, therefore present your findings and plots in the simplest way you can, as it is intended for a non-technical audience.

Remember to check [this guide](https://www.storytellingwithdata.com/chart-guide) if you are unsure about the kinds of plots you should use for the presentation. For further inspiration about storytelling, have a read of [this article](https://medium.com/swlh/storytelling-with-data-part-1-a3bdd5138958).
