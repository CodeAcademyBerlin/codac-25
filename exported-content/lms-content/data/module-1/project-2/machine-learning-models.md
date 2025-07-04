---
title: Machine Learning models
---


## Epic 1: Pick your (ML) fighter

After all your hard work, it is finally time to choose the ML algorithm that you'll use to answer your question. Not all algorithms are created equal, so selecting one depends on the problem at hand: Is it a supervised or unsupervised learning problem? Is it a regression, a classification, or a forecasting problem?

We won't be going into the details of each algorithm in this guide (they're too many!), but bear in mind that you will have to apply several algorithms to the same data set and compare the results.

**Read the Machine Learning Fundamentals chapters if you haven't.**

Please refer to the ML algorithm map we saw during the spike. You can [find it here](https://www.mdpi.com/2075-4426/11/1/32/htm) (figure 1).

We suggest that you explore the different algorithms and their pros and cons. Here is [a wonderful article](https://builtin.com/data-science/tour-top-10-algorithms-machine-learning-newbies) that explains in simple terms different algorithms and their applications. Also, in [this link](https://www.kdnuggets.com/2020/05/guide-choose-right-machine-learning-algorithm.html), you can find more tips about how to choose your algorithm.

**Hint: start with a simple logistic regression**

### Fit your model

Fitting the model means training the model on training data using the .fit() method provided in sklearn. For illustration purposes, we will use Logistic Regression.

```python
# Example
# Fit the model
lr = LogisticRegression()
lr.fit(X_train, y_train)
```

### Predict the test set

Now you will apply the .predict() method to make predictions on test data. These predictions are stored in the variable 'pred\_lr'.

```python
# Make predictions
pred_lr = lr.predict(X_test)
```

There is no point in making predictions if you do not evaluate the results. You will now measure the effectiveness of your trained models to determine and compare how well a model performs.
These model-evaluation techniques are crucial in machine learning model development.

Here’s a list of evaluators used for classification problems.

## Epic 2: Evaluate your model

### The confusion matrix

The confusion matrix is not an evaluation metric but allows you to have a tabular visualisation of the predictions made by your model vs their actual class.

In this example, we want to classify 980 wines as either low or medium quality. After we’ve done the predictions with our model, we want to understand how many predictions were correct in each category, and how many were wrong.

One of the easiest ways to visualise your results is with a confusion matrix, as shown below:

```python
print("Confusion matrix:")
print(confusion_matrix(y_test, pred_lr))
```

![Confusion Matrix](staticAsset/data/Module-1/Project-2/confusion-matrix.jpg "Confusion Matrix")

The metrics are calculated by using true and false positives, true and false negatives:

* **TN (True Negative):** when a case was negative and predicted negative
* **TP (True Positive):** when a case was positive and predicted positive
* **FN (False Negative):** when a case was positive but predicted negative
* **FP (False Positive):** when a case was negative but predicted positive

In this particular case, we have:

* 234 True Positives, meaning 234 bottles were correctly labelled “low”
* 87 False Positives, meaning 87 bottles were incorrectly labelled “low”
* 187 False Negatives, meaning 187 bottles were incorrectly labelled “medium”
* 472 True Negatives, meaning 472 bottles were correctly labelled “medium”

### Accuracy score

Probably the simplest valuation metric, defined as the number of correct predictions divided by the total number of predictions. But be very careful! When you have **imbalanced data** (the number of samples per category is uneven), **the accuracy score can be misleading**.

To illustrate this, we’ll see a commonly used example: imagine you work at a hospital, and you have created an ML model to classify tumours between benign and malign. You run your model and these are your results:

* Of the 91 benign tumours, the model correctly identifies 90 as benign. That's good.
* However, of the 9 malignant tumours, the model only correctly identifies 1 as malignant, meaning that 8 out of 9 malignancies go undiagnosed!

While 91% accuracy may seem good at first glance, your model has zero predictive ability to distinguish malignant tumours from benign tumours, making it useless.

`Accuracy Score = (TP + TN) / (TP + TN + FP + FN)`

```python
print("Accuracy score:", accuracy_score(y_test, pred_lr))
```

![Accuracy Score](staticAsset/data/Module-1/Project-2/accuracy-score.jpg "Accuracy Score")

### The classification report

A Classification report measures the quality of predictions from a classification algorithm, reflecting how many predictions are accurate, whether they're true or false. The report also shows the main classification metrics precision, recall and f1-score on a per-class basis, in this example “low” and “medium”.

```python
print(classification_report(y_test, pred_lr, target_names=["low","medium"]))
```

![Classification Report](staticAsset/data/Module-1/Project-2/classification-report.jpg "Classification Report")

But what do these metrics mean? Here’s a brief description.

#### Precision:

Precision measures the accuracy of correct positive predictions (True Positive) against the sum of True and False Positives. The best value is 1 and the worst value is 0.

`Precision = TP / (TP + FP)`

The False Positives are those predictions that were Negative but our model predicted them as Positive. So, from all the predictions that were classified as Positive, how many were in reality Negative?

![Precision and Recall](staticAsset/data/Module-1/Project-2/precision-recall.jpg "Precision and Recall")

#### Recall:

Is the percentage of True Positives that were correctly identified. The best value is 1 and the worst value is 0.

`Recall = TP / (TP + FN)`

The False Negatives are those predictions that were True but our model predicted them as Negatives. So, from all the predictions that should have been True, what percentage were actually correct?

#### F1 Score:

The F1 score is the harmonic mean of precision and recall, with a best value of 1 and worst of 0. It considers precision and recall simultaneously to tell you how precise your classifier is (how many instances it classifies correctly), as well as how robust it is (it does not miss a significant number of instances).
As a rule of thumb, the weighted average of F1 should be used to compare classifier models, not global accuracy.

`F1 Score = 2*((precision*recall)/(precision+recall))`

### Cohen-Kappa Score

Kappa is an important measure of classifier performance, **especially on imbalanced data sets and multi-class problems**. It expresses the level of agreement between two annotators on a classification problem, one annotator being your ML model, the second classifier being a model that simply guesses at random.

```python
kappa = cohen_kappa_score(pred_lr, y_test)
print("Cohen-Kappa score:", kappa)
```

![Cohen-Kappa Score](staticAsset/data/Module-1/Project-2/kappa-score.jpg "Cohen-Kappa Score")

Here is one _possible_ interpretation of Kappa:

* Poor agreement = Less than 0.20 (including negative numbers)
* Fair agreement = 0.20 to 0.40
* Moderate agreement = 0.40 to 0.60
* Good agreement = 0.60 to 0.80
* Very good agreement = 0.80 to 1.00

I recommend reading [this article](https://www.knime.com/blog/cohens-kappa-an-overview) and [this other article](https://analyticsindiamag.com/understanding-cohens-kappa-score-with-hands-on-implementation/) about Cohen’s Kappa to understand it better.

There are, of course, other metrics that you can use on your ML model. I would suggest exploring them online.

## Epic 3: Model improvement

### Feature selection

Now that you have a working wine type classification system, you can try to interpret one of these predictive models. One of the key aspects in model interpretation is to try to understand the importance of each feature from the dataset.

[This article](https://machinelearningmastery.com/calculate-feature-importance-with-python/) shows how you can check feature importance for various algorithms.

### Parameter tuning and model improvement with k-Fold cross-validation

If during the evaluation you did not obtain good predictions, your model may be **overfitted or underfitted**. You must return to the training step and experiment with the hyperparameters in your model, before fitting and evaluating it again.

Each algorithm has different parameters that can be adjusted. Lots of patience and research is required to improve your models. You will repeat the previous steps until you get satisfying results.

You can use k-fold cross validation to perform a validation of the training set for hyperparameter tuning (check the Machine Learning Fundamentals chapter on Cross-Validation for more details). For this task, you can use the scikit-learn method _cross\_val\_score()_.

Be aware that cross\_val\_score() and cross\_validate() are different things.

### Deploy your model

Deploying a machine learning model gives other people the opportunity to use it, as it will not run only on your laptop but online. It's not something we will cover for now.

Focus on making a presentation with your most important findings and the results of your ML model.

Communication and storytelling are very important soft skills.

## Epic 4: Try different algorithms and pick the best

Repeat the process by choosing other algorithms, compare their results and pick the best one.

## Epic 5: Repeat the process to predict the quality of the wines

Repeat Sprint 3 and 4 in order to predict the quality label for the wines.

## Epic 6: Prepare for the final presentation

BlueBerry Winery's primary goal is to sell their product at a proper price based on the quality. They requested **CODE Analytics** to create a **Wine Quality Analytics System** to help them **determine the quality of the wines produced based on their composition**.

Your Machine Learning model is ready, but you now need to present it to BlueBerry Winery's marketing team. Prepare some slides to showcase your model and your findings, including:

* Most meaningful insights from the exploratory analysis (EDA) that had an impact on this part of the project
* (Very) brief explanation of the steps you followed in your process. Select the most important.
* What features did you choose for your model and why?
* Is there any additional data needed in order to deepen or corroborate your findings?
* How accurate was your model?
* Name 2 or 3 business recommendations for BlueBerry Winery

Remember that you're presenting to a non-technical audience so avoid using jargon, difficult terms, or getting too much into the details of the process. What they need is an overview of how you reached your conclusions.

**You already know the basic guidelines for a presentation. Don't forget to come up with a storyline to convey your message!**

You presentation should be 12-15 minutes long and consist of 6-12 slides.
