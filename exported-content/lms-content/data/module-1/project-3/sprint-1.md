---
title: Sprint 1
---


## Epic 1: Data Wrangling

As you will by now be familiar, data wrangling will always include the same basic steps:

* Check the shape of datasets and column names (make changes where required)
* Handle missing values
* Is any data types conversion required?

The attribute 'dteday' in the bike share dataset is a date that will need to be converted from an object (or string type) to a timestamp. Check the documentation for [Pandas datetime](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.to_datetime.html) if you need a reminder how to do this.

Attributes like season, holiday, weekday, etc. are inferred as integers by Pandas and will also require conversion to categoricals for proper analysis.

Look out for more changes you might be required to make before moving on to data visualization.

Also, consider renaming values to make them more understandable. Eg:

* Holidays:

```python
hdf.loc[hdf['holiday'] == 0, 'is_holiday'] = 'No'
hdf.loc[hdf['holiday'] == 1, 'is_holiday'] = 'Yes'
```

* Season:

```python
hdf.loc[hdf['season'] == 1, 'season'] = 'Winter'
hdf.loc[hdf['season'] == 2, 'season'] = 'Spring'
hdf.loc[hdf['season'] == 3, 'season'] = 'Summer'
hdf.loc[hdf['season'] == 4, 'season'] = 'Fall'
```

Sometimes it helps to create new features. For example, it could be interesting to have a feature called 'warm days' and you can decide whether it is 'yes' or 'no' based on the temperature of the day.

There are many options! Have a think about what else could help you in the next steps, but remember, you can always revisit and create new features as you need them.

## Epic 2: Exploratory Data Analysis

### Formulate your hypothesis

Here are some hypotheses suggestions for things that could influence the demand for bikes:

* **Hourly trend**: most businesses have rush hours and weak hours, bike rentals as well.
* **Daily Trend**: weekdays vs weekends and registered users vs casual users.
* **Rain**: the demand for bikes might be different on rainy days compared to sunny days. Similarly, people prefer to go out on less humid days.
* **Temperature**: in warm countries, temperature generally keeps people inside. You have to check Washington DC's temperature to support your theory.
* **Business model**: businesses often rely on regular customers more than casual customers. There might be some interesting insights that can strengthen this assumption.

### Create some proofs

Always consider the quality of your data (eg. if you observe more bikes being used in Winter, what would you think about that?). Here is an article about Data Quality: <https://www.lotame.com/why-is-data-quality-important/>.

After preprocessing, your dataset is ready for some visual inspection. Think of some plots that would be interesting for a Bike rental company.

**Examples**

Bike usage across Seasons:

![Seasons](staticAsset/data/Module-1/Project-3/seasons.jpg "Seasons")

Monthly average total count for 12 months:

![Holiday](staticAsset/data/Module-1/Project-3/holiday.jpg "Holiday")

![Monthly](staticAsset/data/Module-1/Project-3/monthly.jpg "Monthly")

The following plot requires creating the new feature 'is\_weekend'

![Weekend](staticAsset/data/Module-1/Project-3/weekend.jpg "Weekend")

Explore more kinds of visualisations and come up with 5 or more insights.

### Epic 3: Time Series

Time series is a sequence of observations recorded at regular time intervals. The frequency of the intervals can vary: hourly, daily, monthly, quarterly, etc. Intervals can be large or small, eg: the number of clicks/user visits to a webpage every minute.

You can read more about time series here: <https://www.machinelearningplus.com/time-series/time-series-analysis-python/> (only the _first five sections_ are relevant for this project).

And here you can find more informations on how to handle Time Series in Pandas: <https://pandas.pydata.org/docs/user_guide/timeseries.html>

Once you have gone through the basics, you will be able to create some detailed analysis (daily, monthly, particular days, times, etc).

**Examples**

![January](staticAsset/data/Module-1/Project-3/jan_2011.jpg "January")

![August](staticAsset/data/Module-1/Project-3/28aug2012.jpg "August")
