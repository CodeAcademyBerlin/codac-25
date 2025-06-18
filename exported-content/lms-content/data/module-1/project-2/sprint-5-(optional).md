---
title: Sprint 5 (optional)
---


## Price Labels

This sprint is optional and should only be attempted once you have completed all previous steps.

BlueBerry Winery has a primary goal of giving a proper price tag to their wine based on the quality. You can try to estimate the price along with the assessment of quality for a sample of wine prior to bottling. The current dataset doesn't include any pricing information. Data analysts often search for other datasets to enrich their research and strengthen the analytics outcome.

However, this being your first project, you are provided with the dataset containing wine reviews. Download it [here](https://drive.google.com/file/d/148ndWjamqPBlWsk5yofmmAB9XcikP0bJ/view?usp=sharing).

This dataset requires a few modifications before it can be properly used for this project.

### Filter the data

1. Focus on 'Portugal' and 'Vinho Verde' region.
2. Remove Price outliers **hint:** Take prices between (Q1-1.5(IQR) and Q3+1.5(IQR)).
3. You can assume prices will increase with wine quality.

### Categorize Price Ranges

Cut ratings or prices into 3 levels (or n levels depending on how many quality labels you have). For each level, check the price range (min\_price, max\_price) and mean\_price/median\_price.

Last, try to estimate the price of wines in your original dataset and provide suggestions on the price per quality label.

You do not need a Machine Learning algorithm to complete this part of the project.
