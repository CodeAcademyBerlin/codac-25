---
title: ML Clustering with K-means
---


This sprint focuses on **unsupervised learning**, a machine learning method that analyzes _unlabeled data_ to discover inherent structures, processes, features, and groupings within a dataset.

**Clustering** is the task of grouping data points into clusters where members are more similar to each other than to those in other groups. On a fundamental level, it's about grouping similar objects.

In this project, you will focus on the most common clustering algorithm: **K-Means**.

According to the [sklearn documentation](https://scikit-learn.org/stable/modules/clustering.html#k-means):

> _" (the) KMeans algorithm clusters data by trying to separate samples in n groups of equal variance, minimizing a criterion known as the inertia or within-cluster sum-of-squares... This algorithm requires the number of clusters to be specified, "_ which is what the _k_ stands for in the name of the algorithm. Inertia, on the other hand, _"... can be recognized as a measure of how internally coherent clusters are."_

**We will only look at the _K-means clustering method_** **because it is the most widely used.**

## Customer Segmentation

When analyzing sales data, understanding customer buying patterns often involves using three key parameters for each individual customer:

* **Monetary** - total sum of their sales
* **Frequency** - total count of their orders
* **Recency** - how many days have passed since their last purchase

If you follow this route, you will need to engineer these features. You can use Pandas in Python, or write a query in SQL, to group your customers by ID and calculate these values. **Hint:** in SQLite, use the `julianday()` function to calculate the number of days between two dates.

\<!-- First, we will create a new DataFrame by grouping the customers based on their ID and summing the Sales column:

\`\`\`python
df\_monetary = df.groupby('Customer ID', as\_index=False)\['Sales'].sum()
df\_monetary.head()
\`\`\` -->

\<!-- Do the same with Frequency (How many unique Order IDs are there per customer?) and the Recency (Calculate it from the last order date in the dataset) and then merge all the 3 DataFrames. -->

You should have a DataFrame that looks something like this:

![Mon, Freq, Rec DataFrame](staticAsset/data/Module-2/Project-6/mon-freq-rec.png "Mon, Freq, Rec DataFrame")

### Pre-Processing

#### Outliers

Visualize your DataFrame using boxplots or scatterplots: are there outliers?

The K-Means algorithm is sensitive to outliers, consider removing each feature's (statistical) outliers using the Interquartile Range (IQR).

#### Feature Scaling

K-means using Euclidean distance to measure similarity between data points, so it is crucial to rescale the variables to a comparable scale. A quick reminder of two common rescaling techniques:

* **Min-Max scaling** - rescales all values 0-1
* **Standardisation** - mean-0, sigma-1

Here is an example of the `StandardScaler()` from sklearn:

```python
# Rescaling the attributes
rfm_df = rfm[['Monetary', 'Frequency', 'Recency']]

# Instantiate
scaler = StandardScaler()

# fit_transform
rfm_df_scaled = scaler.fit_transform(rfm_df)
rfm_df_scaled.shape

# create new DataFrame from result
rfm_df_scaled = pd.DataFrame(rfm_df_scaled)
rfm_df_scaled.columns = ['Monetary', 'Frequency', 'Recency']
rfm_df_scaled.head()
```

## Building the model

K-means works by defining **k** number of **centroids** within your data. This is either random, or with the improved **K-means++** approach, randomly placing the first centroid, but using probabilistic selection to evenly distribute remaining centroids.

A centroid is the mean of data points within a cluster - but we have to define initial clusters before we can start making these calculations. Each data point is assigned to its nearest centroid. The mean of all data point distances from the centroid are calculated per cluster, and the position of the centroids are updated. We repeat this process until our clusters are defined.

\<!-- K-means clustering is one of the simplest and most popular unsupervised machine learning algorithms.&#x20;
\- First, we randomly initialize \_k\_ points, called means. In this case, we will use 4 as a value.

\- We categorize each item to its closest mean and update the mean's coordinates, which are the averages of the items categorized in that mean so far.

\- We repeat the process for a given number of iterations, and, in the end, we have our clusters.

\`\`\`python
\# k-means with some arbitrary k
kmeans = KMeans(n\_clusters=4, max\_iter=50)
kmeans.fit(rfm\_df\_scaled)
\`\`\`

\`\`\`python
\# Assign the labels to each data point, and execute the following script.
kmeans.labels\_
label\_list=kmeans.labels\_
sorted(Counter(label\_list).items())
\`\`\`

!\[Labels dictionary]\(staticAsset/data/Module-2/Project-6/labels\_dict.png) -->

### Defining K

K is defined by you - how many clusters should be created?

You can use two methods to determine the optimal k: **the Elbow method and the Silhouette analysis.**

#### The Elbow Method

Your first thought might be that increasing the number of clusters (_k_) will improve the fit of our model, but we actually risk over fitting it. The Elbow Curve helps identify the point at which splitting into more clusters plateaus the information provided to our model. Ideally, we want the lowest Sum of Squared Distance (SSD), also known as inertia, but we also want as few clusters as possible.

The optimal _k_ value will be where the average distance falls off suddenly - when the curve starts to become parallel to the x-axis.

```python
# Elbow-curve /SSD
ssd = []
for num_clusters in range(1,10):
    kmeans = KMeans(n_clusters=num_clusters, max_iter=50, random_state=42)
    kmeans.fit(rfm_df_scaled)
    ssd.append(kmeans.inertia_)

# plot the SSDs for each n_clusters
sns.lineplot(y=ssd, x=range(1,10))
```

![Elbow curve](staticAsset/data/Module-2/Project-6/elbow_curve+.png "Elbow curve")

In this case, we can assume that the optimal number of clusters is 3, but since the Elbow is not very prominent, we should clarify the result with another evaluation technique.

#### Silhouette Analysis

Silhouette analysis observes the distance of a data point to other clusters, specifically its average distance to all points in its _own_ cluster (_p_), and its average distance to all points in the _nearest neighboring cluster_ (_q_). Ideally, we want a higher silhouette score, which indicates good separation between clusters, and tightness within clusters.

![silhouette score](staticAsset/data/Module-2/Project-6/sil-score.png "silhouette score")

The value of a silhouette score lies between -1 and 1:

* A score closer to -1 indicates that the data point is not similar to the data points in its cluster, and therefore likely assigned to the wrong cluster.
* A score of 0 indicates that the sample is on or very close to the decision boundary between two neighboring clusters.
* A score closer to 1 indicates that the data point is very similar to other data points in the cluster, and therefore well-placed.

```python
for num_clusters in range(2,10):
    # initialize kmeans
    kmeans = KMeans(n_clusters=num_clusters, max_iter=50, random_state=42)
    kmeans.fit(rfm_df_scaled)

    cluster_labels = kmeans.labels_

    # silhouette score
    silhouette_avg = silhouette_score(rfm_df_scaled, cluster_labels)
    print(f"For {num_clusters} clusters, the silhouette score is: {silhouette_avg}")
```

Based on the information given here and some research online, determine whether _k=3_ is the right choice.

## Train your model

Now train your final model with the appropriate value of _k_, and assign the resulting labels to your DataFrame before scaling:

```python
# assign the label
rfm['Cluster_Id'] = kmeans.labels_
rfm.head()
```

Visualize the results:

```python
# Box plot to visualize Cluster Id vs Monetary
sns.boxplot(x='Cluster_Id', y='Monetary', data=rfm)

# Box plot to visualize Cluster Id vs Frequency
sns.boxplot(x='Cluster_Id', y='Frequency', data=rfm)

# Box plot to visualize Cluster Id vs Recency
sns.boxplot(x='Cluster_Id', y='Recency', data=rfm)
```

Now that you've gone through these basic steps, you can draw conclusions about the behavior of the three groups.

## Consider more parameters (optional)

The above analysis is elementary: it only considers 3 elements of a dataset that contains a lot of information.

Try to think about other parameters that you could consider in the analysis that make sense. For example:

* Are there any perceivable differences in behavior between Corporate and Consumer Segments?
* Could you deduce patterns between the product categories?
* Are there any noteworthy differences between the states?

## Additional Reading & Resources

* ["Understanding K-means Clustering in Machine Learning"](https://towardsdatascience.com/understanding-k-means-clustering-in-machine-learning-6a6e67336aa1)
* [Effect of outliers on K-Means algorithm using Python](https://medium.com/analytics-vidhya/effect-of-outliers-on-k-means-algorithm-using-python-7ba85821ea23)
* [Elbow Method for optimal value of k in KMeans](https://www.geeksforgeeks.org/elbow-method-for-optimal-value-of-k-in-kmeans/)
* [scikit-learn docs Silhouette Analysis](https://scikit-learn.org/stable/auto_examples/cluster/plot_kmeans_silhouette_analysis.html)
* [Is Silhouette Analysis Better Than Elbow Method?](https://towardsdatascience.com/silhouette-method-better-than-elbow-method-to-find-optimal-clusters-378d62ff6891)

### Feedback Form

\<iframe width="100%" title="Project-1-feedback-form" height="1000px" src="https://docs.google.com/forms/d/e/1FAIpQLSfxACEn\_EvqbI2LeEj9Tl-t\_dmWRbvfeWaESViI-r42QzHN\_A/viewform?embedded=true"/>
