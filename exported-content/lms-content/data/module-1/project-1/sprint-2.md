---
title: Sprint 2
---


If you're new to the technical field, then programming is the best place to start.

Currently, the two programming languages used most in data science are Python and R.

**R:** A programming language for statistical computing. R is widely used for developing statistical software and data analysis.

**Python:** A high-level, general-purpose programming language. Python is widely used in many applications and fields, from simple programming to quantum computing. Python is a beginner-friendly programming language, making it a great place to start with data science, and due to it's popularity, there are many resources available to learn it independently of your goal application field.

We will use Python throughout the course.

## Epic 1: What Is Python?

Python was developed by Guido van Rossum. Many major online platforms, such as Google, Dropbox, Instagram, YouTube, and Spotify, all run on Python. It is **multi-paradigm** (meaning you can apply object-oriented or functional programming principles), **interpreted** (code is executed line-by-line rather than compiled), **high-level** (many machine-level tasks are automated, making for a simpler developer experience) programming language.

For Data Science, you don't need to understand all of these characteristics, however check other features that might be helpful for you to understand why it is so widely used:

* **Readable**: Python is a very simple language with a straightforward syntax.
* **Easy to Learn**: Python is an expressive and high-level programming language, which means it is easy to understand the language and thus easy to learn. Nowadays, most universities choose to teach students Python as it is well-suited for beginners.
* **Cross-platform**: Python is available and can run on various operating systems such as Mac, Windows, Linux, Unix etc. This makes it a cross-platform and portable language.
* **Open Source**: Python is an open-source programming language.
* **Large standard library**: Python comes with a large standard library that has many handy methods and functions which we can use while writing code in Python.
* **Free**: Python is free to download and use. See: [Open Source Python License](https://docs.python.org/3/license.html). Python is an example of a FLOSS (Free-Libre / Open Source Software), which means you can read its source code and modify it, and even freely distribute copies of this software.
* **Supports exception handling**: If you are new, you may wonder what is an exception? An exception is an event that can occur during a program execution and can disrupt the normal flow of the program, i.e. an error causes your code to crash 😓 Python supports exception handling, which lets us write less error-prone code, and we can test various scenarios that could cause problems later on.
* **Advanced features**: Supports generators and list comprehensions. We will cover these features later.
* **Automatic memory management**: Python supports automatic memory management which means the memory is cleared and freed automatically.

More details on that can be found [here](https://www.geeksforgeeks.org/python-features/)

#### What can Python do?

* Python is used for desktop GUI (graphical user interface) applications, websites and web applications.
* Python can be used alongside software to create workflows.
* Python can connect to database systems and modify the contents of the database.
* Python can be used to handle big data and perform complex mathematics.
* Python can be used for rapid prototyping, or for production-ready software development.

## Epic 2: Install Python

The recent major version of Python is Python 3, which we will use throughout our course.

Python can be written in a simple text editor, but it is better to write Python in an **Integrated Development Environment (IDEs)**, such as Pycharm, Spyder, Netbeans or Eclipse, which are particularly useful when managing large collections of Python files. However, in the beginning, you will start writing Python code using **Visual Studio Code** as it offers advanced editing, analysis, debugging, and profiling functionality. You can find and download it here: [Visual Studio Code](https://code.visualstudio.com/Download).

Python, like many other programming languages, has different versions. Sometimes when we create software, it needs to run on a specific version of the language because as it expects certain features or behavior that is present in specific versions. The same is true for the libraries/packages we will be using: as the packages and language module are updated, there will be newer versions that are simply incompatible with older versions as features change.

We may have many projects on our computer, perhaps a Flask app that runs on version 0.11 (the first one you made!) and Python 2.7, and then also a more modern Flask app that runs on version 0.12 and Python 3.4. If I try running both at once on Python 2 or Python 3, one of them may break because some of the code that runs on Python 2 doesn't run on Python 3 or vice versa. This is where virtual environments become useful.

**Virtual environments** keep these dependencies in separate "sandboxes" so you can switch between both applications easily and get them running. For those more familiar with programming, virtual environments are analogous to Docker containers. Additionally, package managers for other languages, like JavaScript's NPM (Node Package Manager), take care of most of these details for you, but you'll have to get your hands dirty in Python and deal with the environments yourself.

In this course we will use **Conda**, the package manager associated with **Anaconda**. Installing Anaconda will install both Python and Conda, along with a selection of packages useful for data analysis.

To install Anaconda for Windows, please follow these [steps](https://docs.anaconda.com/anaconda/install/windows/).

To install Anaconda for macOS, please follow these [steps](https://docs.anaconda.com/anaconda/install/mac-os/).

After the installation, verify it by [following these instructions](https://docs.anaconda.com/anaconda/install/verify-install/).

Once you finish with the installation and verify it was successful, open Visual Studio Code and create a file called `test.py`. From the top menu bar in VSCode, open the View menu and select the Command Palette. In the Command Palette, type _Python: Select Interpreter_ and select the Python installed in the Conda environment. When you have a Python file open in VSCode, you should also be able to see in the status bar (at the very bottom right) either the environment, or the language version, you are currently running.

Now in the Text Editor space type:

```python
print("Hello World")
```

And now click on the Play Symbol (▶️). This will show the result of print in the integrated terminal of Visual Studio Code. If not, book an appointment with your mentor to help you with the settings.

## Epic 3: Python in Action

Congratulations on setting up the necessary tools. Now, you will start learning the core concepts of Python. This week, you will have to solve some exercises using Python.

For these exercises and for the future projects, we will use a `.ipynb` file. It is a notebook created by Jupyter Notebook, an interactive computational environment that helps to use and analyze data using Python. Go ahead and create a file called `exercises.ipynb` and add your first code cell. You can run each cell separately, so create a new cell for each exercise.

#### Writing Expressions with Variables

To get started, here are some simple exercises to create and use variables and expressions. Variables are how you store data and the results of calculations. Expressions are how you calculate values.

**Exercise 1**

In your file create a variable called my\_name with your name as the value. Put your name inside string quotes, e.g., "my name". Then add a line of code to print the variable name.

Save your file and run the cell. You should see your name printed. If not, investigate and fix it.

**Exercise 2**

Create a variable called age with a number that is your age. Do not use string quotes for numbers.

Add a line to print that variable. Save the file and run the cell. You should see your age.

**Exercise 3**

Create a variable called julia\_age with the value 32. Create another variable called age\_diff and set it to an expression that calculates your age minus Julia's age. Print your age and the value of age\_diff. If you are younger than Julia, age\_diff should be a negative number.

### Writing Code with Conditionals

Conditionals are forms used in programming to tell the computer to do different things, depending on some test, e.g., "if the user is logged in, say "Hi", else say "Please log in."

The most basic conditional form is if...else...

**Exercise 4**

Write a conditional that compares the variable holding your age with the number 21. It should print either "You are older than 21" or "You are not older than 21", appropriately, depending on your age.
Save your file and run the cell. Make sure you see the correct message. Try changing your age in the file to make sure the other message prints when it should.

**Exercise 5**

Write a conditional that compares your age with Julia's age. This conditional will need to test if you are older, younger, or the same age, and print, appropriately, either "Julia is older than you", "Julia is younger than you", or "You are the same age as Julia".

Save your changes and run the cell.

### Lists and Loops

**Exercise 6**

Create a list with all the names of your class (including mentors). Sort the list alphabetically, then print the first element of the list.\
On the next line, print the last element of the list.\
On the next line, print all the elements of the list (use a "for" loop).

**Exercise 7**

Create a list with all the ages of the students in your class. Iterate through the list using a for loop, and then print every age. Add a conditional inside the loop to only print even ages (**Hint:** have a look for Python's modulus operator).\
Try to do the same thing using a while loop.

**Exercise 8**

Write a list containing numbers and print the lowest number.

**Exercise 9**

Write a list containing numbers and print the highest number.

**Exercise 10**

Given below is a list of 10 customers with year of birth, however, the list can be as large as several thousands of customers.

```python
[1999, 1995, 2005, 2010, 2007, 2006, 1994, 1996, 1979, 2008]
```

Use a loop to iterate over the list and print the age of each customer.

**Exercise 11**

Given below is a list of 10 customers with name and year of birth, however, the list can be as large as several thousands of customers.

```python
customer_list = [
                    {"name": "Bob", "age": 1999},
                    {"name": "Jack", "age": 1995},
                    {"name": "Lisa", "age": 2005},
                    {"name": "Maria", "age": 2010},
                    {"name": "Ben", "age": 2007},
                    {"name": "Emma", "age": 2006},
                    {"name": "Oscar", "age": 1994},
                    {"name": "Amy", "age": 1996},
                    {"name": "Paul", "age": 1979},
                    {"name": "Etta", "age": 2008}
                ]
```

Use a loop to iterate over the list and print the name and age of each customer.\
Afterwards, for each customer try to print the sentence "_customer\_name_ is _customer\_age_ years old".\
customer\_name and customer\_age should correspond to each customer's name and age.

**Exercise 12**

Given a list of ages, remove the youngest and the oldest person.

```python
ages = [20, 24, 14, 9, 12, 13, 25, 23, 40, 11]
```

For this exercise try not to use the max() and min() methods.

**Exercise 13**

You have two lists with ages of customers from different cities.

```python
berlin = [15, 13, 16, 18, 19, 10, 12 ]
munich = [7, 13, 15, 20, 19, 18, 10, 16]
```

The task is to create a new list with the common ages.

**Exercise 14**

You have a list with ages.

```python
[15, 13, 16, 18, 19, 15, 10]
```

Remove the duplicates.

### Functions

**Exercise 15**

Write a function that takes a person's name and prints a custom message for them.

E.g. Function name: **welcome**

welcome('Evelyn') would print- 'Welcome Evelyn, have a nice day!'

welcome('Jost'), would print - 'Welcome Jost, have a nice day!'

**Exercise 16**

Write a function that takes a string as input and calculates the length.

Function name: **get\_length**

get\_length('Hello') would print / return 5.

get\_length('Hi') would print / return 2.

**Exercise 17**

Write a function which checks whether a number is even.

Function name: **check\_even**

check\_even(6) would print / return 'Yes'

check\_even(5) would print / return 'No'

**Exercise 18**

Rewrite exercises 11, 12, 13, and 14 in a function.

**Exercise 19**

Write a function that takes a list of integers and also a single integer as inputs. It should return true or false if the single integer value is present or not in the list.

### Extra Exercises

Do the intermediate exercises in this document (optional).

[Link of assignment](https://drive.google.com/file/d/1QXg2VVJSBZPDfIUtpIFsgIIzaD6ROYBc/view?usp=sharing)

### Looking for More Challenges?

[Code Wars](https://www.codewars.com/)

## Epic 5: Version Control

In data science and software development in general, one of the most important concepts to master — or try to — is version control.
Whenever you work on a data science project, you will need to write different code files, explore datasets, and collaborate with other data scientists.
Managing changes in the code is done via version control, namely, using Git.

Install [Git](https://git-scm.com/downloads) on your computer.
