---
title: Sprint 1
---


## 🎬 Data Visualization with Tableau

**Welcome to your first data project!**


This sprint introduces you to one of the most powerful tools in the data science toolbox: **visualization**. You’ll explore a real-world dataset [`movies.csv`](https://drive.google.com/file/d/1SqcQmwsuKuAkWzgDXosGgF2rSbp-0s9W/view?usp=sharing) and begin building your storytelling and analytical skills using **Google Sheets** and **Tableau**.

Instead of getting lost in rows of numbers, you’ll bring the data to life through **charts, graphs, and insights**. Whether your audience is technical or not, a well-crafted visualization helps them see what you see, instantly.

You’ll kick things off in Google Sheets, where you’ll explore the dataset and start identifying different types of data. Then, you’ll move into Tableau and build visualizations like **bar charts**, **line plots**, **pie charts**, **scatterplots**, and more.

But visualizing data isn’t just about using the right tools. It’s about thinking critically:

* What kind of data are you working with?
* What kinds of stories can you tell?
* Which charts help your audience understand the data best?

By the end of this week, you’ll have created your first **data-driven presentation**, a visual narrative that uncovers trends, relationships, and insights in movie data.

**Let’s get started.** 🚀



### Explore the Dataset with Google Sheets

#### Import the Data

* Open [Google Sheets](https://sheets.google.com)
* Create a new blank spreadsheet
* Import the `movies.csv` file
* When prompted, select **Comma** as the separator


&#x20;

#### Get to Know the Data

Spend some time exploring the dataset:

* Sort and filter different columns.
* Look for interesting patterns, missing values, or unusual entries.
* Ask yourself: What questions could this data answer?








## What Kind of Data Are You Working With?

Before you start building visualizations, it's important to understand what kind of information is in your dataset. After all, different types of data call for different kinds of charts.

Let’s take a quick look at how your data is structured.

The `movies.csv` file is organized as a **table**, which is one of the most common formats in data analysis.

* Each **row** represents a single movie.
* Each **column** holds an **attribute**, like title, genre, release date, or runtime.

An **attribute** is simply a piece of information that tells you something about each item in your dataset. In this case, each attribute describes one aspect of a movie.

Because this data is arranged into rows and columns, we call it **tabular data**. It’s clean, flexible, and ideal for many types of analysis and visualization.

The next step is to look more closely at those attributes and figure out what kinds of values they contain. That will help you choose the right visuals to bring your data to life.








## Understanding Attribute Types

Not all attributes are the same. Some contain text, some contain numbers, and some represent ordered categories or dates. Before choosing how to visualize a column of data, you need to know what type of attribute it is.

There are three main types to recognize: **Categorical, Ordinal and Quantitative Attributes**



### Categorical Attributes

These contain values that describe categories with no particular order.

**Example:** `Category` → Furniture, Technology, Office Supplies
These are all **categorical** values because they describe types of items, and there is no natural order between them. You cannot do calculations with these values, and you can rearrange them in any order without changing their meaning.

![table 1](staticAsset/data/Module-1/Project-1/table-1.png "table 1")



### Ordinal Attributes

Ordinal attributes are similar to categorical ones, but their values follow a meaningful order.

**Example:** `Priority` → Low, Medium, and High
These can be ordered from least to most urgent, but the exact distance between each level is not defined. You cannot subtract Medium from High in a meaningful way.

![table 2](staticAsset/data/Module-1/Project-1/table-2.png "table 2")



### Quantitative Attributes

Quantitative attributes are numeric values that represent measurable quantities. These values can be added, subtracted, and averaged.

**Example:** `Sales` → $400, $200
These are **quantitative** values, because the difference between them is meaningful. A sale of $400 is twice as much as a sale of $200.

Quantitative attributes are the most flexible for visualization, and they work well in bar charts, line plots, histograms, and scatter plots.

![table 3](staticAsset/data/Module-1/Project-1/table-3.png "table 3")



> 💡 Tip: Just because something is a number does not mean it is quantitative. For example, `Order ID` may be a number, but if it is only used as a unique identifier, it should be considered **categorical** instead.








## Understanding Attribute Semantics

In addition to knowing whether an attribute is categorical, ordinal, or quantitative, it also helps to understand the meaning behind the values. This is called **attribute semantics**. Some attributes represent time, some relate to geography, and others follow patterns like cycles or hierarchies. Recognizing these meanings will help you choose the most appropriate chart later on.



### Temporal Attributes

A temporal attribute relates to time.

**Example:** Dates or times (`Order Date`)
This is a **temporal** attribute because the values follow a time sequence. You can sort them chronologically or calculate the time between two dates. While dates can be converted into numbers, they are not considered quantitative in the typical sense. Instead, they are used to show changes or trends over time, such as in a line chart.



### Spatial Attributes

A spatial attribute relates to geographic location.

**Example:** Geographic locations (`Country`, `Latitude`)
The `Country` column is a **categorical** attribute, but it also has **spatial** meaning because it refers to places. Attributes like `Latitude` and `Longitude` are **quantitative**, but they are also spatial because they describe positions on a map.



### Cyclic Attributes

Cyclic attributes contain values that repeat in a cycle.

**Example:** Repeating intervals (`Month`, `Day of Week`)
`Month`, `Day of Week`, and `Hour` are all **cyclic** because after the last value, the sequence returns to the beginning. These attributes are often visualized using grouped bar charts, circular charts, or heatmaps that show repeated patterns.



### Diverging Attributes

Diverging attributes are centered around a natural midpoint, usually zero, with values moving in both positive and negative directions.

**Example:** Values around a midpoint (`Profit`)
A `Profit` column may contain positive and negative values. Profits above zero represent gains, while those below zero represent losses. These attributes are quantitative, and they are best visualized using color gradients or bar charts that clearly show the direction of change from the midpoint.



### Hierarchical Attributes

Hierarchical attributes are structured in levels, where one value is part of a broader category.

**Example:** Nested categories (`Category` and `Sub-Category`)
The `Category` column might include values like `Furniture`, while a related `Sub-Category` column could include values like `Chairs` or `Desks`. These are **hierarchical** because each sub-category fits within a larger category. This structure is useful for visualizations like tree maps or nested bar charts.






You may not find all of these attribute semantics in every dataset, but it's helpful to keep them in mind. Recognizing these patterns will make your visualizations more accurate and more effective.

👉 **Now, your turn. Go to the `movies.csv` dataset from earlier and try to identify the data attribute types and semantics for each column.**








## From Attribute Types to Visual Choices

Now that you understand attribute types, it’s time to put that knowledge into practice. The kind of data you’re working with should guide your choice of chart, not the other way around.

Let’s look at how this plays out using Google Sheets.



### Step 1: Bar Chart of Genre

![genre bar](staticAsset/data/Module-1/Project-1/Count-of-Genre-gs.png "genre bar")

Start by creating a bar chart showing the number of movies in each `Genre`.

* Use Google Sheets to count how many times each `Genre` appears.
* Create a bar chart to display this.

Bar charts are perfect for **categorical** attributes like `Genre`. Each bar represents a category, and the height shows how frequently it appears in the data.



### Step 2: Try the Same Data in a Line Chart

![genre line 1](staticAsset/data/Module-1/Project-1/Count-of-Genre-gs-2.png "genre line 1")

Now take the same `Genre` data and visualize it using a **line chart**.

At first glance, a line chart might look polished. It shows highs and lows, and your brain wants to see a trend. But here’s the problem: `Genre` is a **categorical** attribute with no natural order. The line chart suggests continuity where there isn’t any.

In fact, if you reorder the categories or sort them alphabetically, the shape of the line will change completely. The "trend" disappears or reverses, because it was never real.

Line charts work best with **temporal** or **quantitative** data, where order and direction matter.



### Step 3: Sort Genre Alphabetically

![genre line 2](staticAsset/data/Module-1/Project-1/Count-of-Genre-gs-3.png "genre line 2")

Try sorting the `Genre` column alphabetically and look at how both the bar and line charts respond.

* In the **bar chart**, you can still read the distribution clearly.
* In the **line chart**, the shape changes, even though the data hasn’t.

This shows why bar charts are much better suited for categorical data. They allow flexibility in order and still preserve the meaning.



### Step 4: Create a Meaningful Line Chart

![run time by year](staticAsset/data/Module-1/Project-1/runtime-by-year-gs.png "run time by year")

Now let’s make a line chart that **does** make sense.

Try creating a new column called `Release Year` by extracting the year from the full release date. Then:

* Group the movies by `Release Year`
* Calculate the **average** `Runtime` for each year
* Create a line chart showing how runtime has changed over time

This is a great example of a proper use of a line chart. You're using a **temporal** attribute on the X-axis and a **quantitative** attribute on the Y-axis, which makes trends visible and meaningful.



> ✅ Key takeaway: The type of attribute on your axis matters.
>
>








## Getting Started with Tableau

Now it's time to move from spreadsheets to a professional tool. Tableau is a widely used Business Intelligence platform that helps you create powerful and interactive visualizations without writing code.

In this sprint, you will get a hands-on introduction to Tableau and start building your first visual stories from the `movies.csv` dataset.



### Why Tableau?

As a data analyst or scientist, you will work with many tools, and code is just one part of the job. Equally important are:

* Asking good questions
* Spotting patterns
* Communicating clearly
* Designing visualizations that make sense

This project gives you a first taste of that process. Later in the course, you will use Python for deeper analysis, but the mindset you build here will carry forward.



### Set Up Tableau Public

1. Download and install [Tableau Public](https://www.tableau.com/products/public/download)
2. Open Tableau and choose **Text file** under the **Connect** menu
3. Select your `movies.csv` file
4. In the import screen, make sure the separator is set to **Comma**

5. Check **Cleaned with Data Interpreter** to tidy up the data

Once the data looks correct, click `Sheet 1` to start creating your first chart.








## Fundamental Charts in Tableau

### Bar Chart – Genre Popularity

Bar charts are ideal for comparing the size or frequency of categories.

You can read more about bar charts [here](https://www.storytellingwithdata.com/blog/2020/2/19/what-is-a-bar-chart).

![tableau genre bar](staticAsset/data/Module-1/Project-1/Genre-Popularity.png "tableau genre bar")

**Instructions:**

* Drag `Genre` to the **Columns** shelf
* Drag `Genre` to the **Rows** shelf, then right-click it and select **Measure → Count**
* Right-click the `Null` category and choose **Exclude**
* Right-click the `Genre` axis and choose **Sort → Sort by Field**
* Right-click the labels and choose **Rotate Label** to improve readability



### Pie Chart – MPAA Rating Distribution

Pie charts show how a whole is divided into parts. Use them sparingly and only when the number of categories is small.

More on pie charts [here](https://www.storytellingwithdata.com/blog/2020/5/14/what-is-a-pie-chart).

![tableau mpaa pie](staticAsset/data/Module-1/Project-1/MPAA-Rating-Percentage.png "tableau mpaa pie")

**Instructions:**

* Drag `MPAA Rating` to both **Columns** and **Rows**
* Right-click one and select **Measure → Count**
* Go to the **Show Me** panel and choose **Pie Chart**
* Drag `MPAA Rating` to **Label Marks** and choose **Measure → Count**
* Right-click and select **Quick Table Calculation → Percentage**
* Format numbers to show as **Percentages** with **0 Decimal places**



### Line Chart – Trends Over Time

Line charts help reveal trends over time or across ordered categories.

Read more about line charts [here](https://www.storytellingwithdata.com/blog/2020/3/24/what-is-a-line-graph).

![tableau line plot 2](staticAsset/data/Module-1/Project-1/Runtime-over-years.png "tableau line plot 2")

**Instructions:**

* Drag `Release Date` to the **Columns** shelf
* Drag `Runtime` to the **Rows** shelf
* Change `Release Date` to **Year**
* Right-click `Runtime` and select **Measure → Average**

Create a second line plot showing seasonality across months:

![tableau line plot](staticAsset/data/Module-1/Project-1/Release-by-month.png "tableau line plot")



### Scatter Plot – Comparing Two Quantities

Scatter plots are useful when you want to explore the relationship between two **quantitative attributes**, like `Budget` and `Gross`.

![tableau scatter plot](staticAsset/data/Module-1/Project-1/Budget-Gross.png "tableau scatter plot")

Try creating a scatter plot like this:

* Drag `Budget` to the **Columns** shelf
* Drag `Gross` to the **Rows** shelf
* Add `Genre` to **Color** to explore category groupings



### Comparing Three Attributes – Bar Chart Variations

So far, you’ve mostly compared two variables. But what if you want to include a third?

Two useful options:

* **Stacked Bar Chart**: Good for showing proportions within categories
* **Grouped Bar Chart**: Good for comparing values across multiple categories side by side

To create both:

* Drag `Genre` to **Columns**
* Drag `Genre` again to **Rows**, set it to **Measure → Count**
* Drag `MPAA Rating` to **Color** for stacked view
* Drag `MPAA Rating` to **Columns** for grouped view

Explore both and see which works best for your data.



### Pushing the Limits – Four Variables

You can even compare **four** variables in a single chart using:

* X-axis
* Y-axis
* Color
* Size

For example, in a scatter plot:

* X-axis: `Budget`
* Y-axis: `Gross`
* Color: `Genre`
* Size: `IMDB Rating`

Just be careful, more isn’t always better. Sometimes two simple plots communicate more clearly than one cluttered one.



### Chart Inspiration Resources

Looking for more chart types or ideas on how to present your data? Here are some great resources for exploring different types of visualizations. Use these resources for inspiration as you experiment with your own data!

* [Storytelling with Data - Chart Guide](https://www.storytellingwithdata.com/chart-guide) – A catalog of charts with explanations and use cases
* [Tableau Public - Viz of the Day](https://public.tableau.com/app/discover/viz-of-the-day) – Search and explore what others have built in Tableau



### Explore, Iterate, Reflect

Over the next two days, your task is to explore the dataset by creating many different charts.

Try:

* Bar charts
* Pie charts
* Line plots
* Histograms
* Scatter plots
* Stacked and grouped bar charts

Not every chart will show something interesting, and that’s fine. Your goal is to **practice**, **explore**, and **develop insights**.

Start collecting the most useful and interesting plots. These will become the core of your final presentation.



### Prepare Your Presentation

At the end of this sprint, you’ll create a simple presentation with your best visualizations.

**Use any tool you like.** We recommend [Canva](https://www.canva.com/) for its clean interface and design features.

Tips:

* Assume your audience is non-technical
* Make your story clear
* Keep visual style consistent (colors, fonts, layout)
* Use each chart as **evidence** for your conclusions

This is your first data story. Make it insightful and engaging. 🎨📊
