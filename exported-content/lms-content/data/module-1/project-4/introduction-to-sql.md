---
title: Introduction to SQL
---


During the next two weeks, you will take a little break from Machine Learning predictions and learn a very in-demand skill: **SQL**. For data analyst roles, there's no doubt that learning SQL should be at the top of your to-do list.

## What is SQL?

In order to understand SQL, we will first define three basic concepts.

**RDBMS**: RDBMS stands for Relational Database Management System. It is the basis for SQL, and for all modern SQL database systems. RDBMS format data into tables, a single database will usually be made of many related tables. Each table is a collection of related data entries, and it consists of columns (fields) and rows (records).

A column (field) is a vertical entity designed to maintain specific information about every record in the table.

A row (record) is a horizontal entity in a table that stores a combination of entries corresponding to the fields. To reduce redundancy, **each record is stored only once**.

Let's look at an example of an individual table:

![Individual table example](staticAsset/data/Module-1/Project-4/individual-table.png "Individual table example")

**SQL**: SQL stands for **Structured Query Language** and is the language used to interact with relational databases. Executing queries let's you perform the following functionalities:

* Retrieve data
* Insert, update and delete records
* Create new databases, new tables and views
* Create stored procedures
* Set permissions for all of the above
* Many more!

**Database design**: Database design refers to the organization of data according to a database model or schema. The person in charge of the design determines what data must be stored, the type of data in each field, and how the data elements interrelate. One of the most important aspects is understanding and identifying interrelationships between several individual tables in order to build the database.

![Database example](staticAsset/data/Module-1/Project-4/database-example+.png "Database example")

Tables are connected by primary and foreign keys, and correspond to columns or fields:

* **Primary key**: A primary key _uniquely identifies_ records in a table, eg. BorrowerID, LoanID, and BookID. There can be only one primary key per table.
* **Secondary key**: All remaining keys in a table are secondary keys.
* **Foreign key**: A foreign key is an attribute in one table which is the primary key in a different table. A foreign key generates a relationship between the "parent" table and the "child" table. In our example, the primary key BorrowerID in the Borrower table becomes a foreign key called IDBorrower in the Loan table.

**Joining** tables on these keys is a fundamental concept of SQL. **Queries** will always return output in the form of a single table, so when you want information from multiple tables, you must join them together in a way that makes sense for your particular need.

![SQL join gif](staticAsset/data/Module-1/Project-4/sql_join_gif.gif "SQL join gif")

For the next two weeks, you will be completing the '10 Days of SQL' challenge. SQL is a need-to-know skill for Data Analysts and having a good command of it broadens your opportunities. All types of companies, from giants like Facebook and Google, to small businesses, use it to manage their data, making SQL an industry standard.

The main goal of these exercises is for you to deepen and practice your SQL skills, **not for you to complete them all**. Take into consideration there is very often more than one way to solve the problem.

So be curious and happy coding!

## Epic 1: SQL Murder Mystery

Complete this game: [SQL Murder Mystery](https://mystery.knightlab.com/)

## Epic 2: Create a Database using SQLite and DB Browser

Download and install [DB Browser](https://sqlitebrowser.org/dl/), this is a separate interface designed specifically for using [SQLite](https://www.sqlite.org/).

The first step is to create a new database. Name it 'Task 1', you will be creating a new database for each task of the challenge.

After you have you've created your database for Task 1, build the two tables necessary to complete the exercise:

```sql
CREATE TABLE IF NOT EXISTS Manufacturers (
  Code INTEGER,
  Name TEXT NOT NULL,
  PRIMARY KEY (Code)
);

CREATE TABLE IF NOT EXISTS Products (
  Code INTEGER,
  Name TEXT NOT NULL,
  Price INTEGER NOT NULL,
  Manufacturer INTEGER NOT NULL,
  PRIMARY KEY (Code)
);
```

**Note: there are two ways to create the tables. You could use the DB Browser interface, or execute the queries in the 'Execute SQL' tab.**

The database schema looks like this:

![Task1 schema](staticAsset/data/Module-1/Project-4/task1_schema.png "Task1 schema")

Finally, you will populate your 'Manufacturers' and 'Products' tables by running this code in the 'Execute SQL' tab of DB Browser:

```sql
INSERT INTO Manufacturers(Code,Name) VALUES
  (1,'Sony'),
  (2,'Creative Labs'),
  (3,'Hewlett-Packard'),
  (4,'Iomega'),
  (5,'Fujitsu'),
  (6,'Winchester');

INSERT INTO Products(Code,Name,Price,Manufacturer) VALUES
  (1,'Hard drive',240,5),
  (2,'Memory',120,6),
  (3,'ZIP drive',150,4),
  (4,'Floppy disk',5,6),
  (5,'Monitor',240,1),
  (6,'DVD drive',180,2),
  (7,'CD drive',90,2),
  (8,'Printer',270,3),
  (9,'Toner cartridge',66,3),
  (10,'DVD burner',180,2);
```

Verify that both tables have been successfully created on the 'Browse Data' tab. The tables should look like this:

![Manufacturers + Products](staticAsset/data/Module-1/Project-4/Manufacturers_Products_tables.png "Manufacturers + Products")

## Epic 3: Execute queries

By completing the following 10 tasks, you will learn about:

* Simple queries
* JOIN statements
* Aggregate functions
* Sub-queries
* Common Table Expressions (CTE) using the WITH function
* Window Functions

Try to complete one task per day.

## Task 1

### Task 1.1

\-- Select the names of all the products in the store.

[View output example](https://drive.google.com/file/d/18OmjF8i4XDORjhIsudikHxhCEVfXpctW/view?usp=drive_link)

**Task 1.2**

\-- Select the names and the prices of all the products in the store.

[View output example](https://drive.google.com/file/d/1jLwhPtWwc4vKOyw8927mo-XV6s3xhAYh/view?usp=drive_link)

**Task 1.3**

\-- Select the names of the products with a price less than or equal to $200.

[View output example](https://drive.google.com/file/d/16i9-X0CsIAkaXKZsUOpw4eWdliOsKLYt/view?usp=drive_link)

**Task 1.4**

\-- Select all the products with a price between $60 and $120.

[View output example](https://drive.google.com/file/d/1zl-ZPB_VkmHcvqbukQ8s9Ctz5I9U4Co2/view?usp=drive_link)

**Task 1.5**

\-- Select the name and price in cents (i.e., the price must be multiplied by 100).

[View output example](https://drive.google.com/file/d/1eOY21UgbMhH6CkBrx6qUg7fq3VYUBe_6/view?usp=drive_link)

**Task 1.6**

\-- Calculate the average price of all the products.

[View output example](https://drive.google.com/file/d/10_ZqHEz2Ybk8gHCdjD5nYG6tNzHr94V9/view?usp=drive_link)

**Task 1.7**

\-- Calculate the average price of all products with manufacturer code equal to 2.

[View output example](https://drive.google.com/file/d/1lSMrOvtQOEbIewuoxm7GTThEs6zT55oL/view?usp=drive_link)

**Task 1.8**

\-- Calculate the number of products with a price larger than or equal to $180.

[View output example](https://drive.google.com/file/d/12yLI9181szbMmcMKUnu0ee4p6tYhbJ-g/view?usp=drive_link)

**Task 1.9**

\-- Select the name and price of all products with a price larger than or equal to $180, and sort first by price (in descending order), and then by name (in ascending order).

[View output example](https://drive.google.com/file/d/1NffNZTXQTPa32DwUPgZMB-YvHkHc3Arx/view?usp=drive_link)

**Task 1.10**

\-- Select all the data from the products, including all the data for each product's manufacturer.

[View output example](https://drive.google.com/file/d/1YQwM3W5V7elnWDKWJdP4WFhMZo6djhzB/view?usp=drive_link)

**Task 1.11**

\-- Select the product name, price, and manufacturer name of all the products.

[View output example](https://drive.google.com/file/d/1eNnObKQnRCy23k9TMtt6Y9CWXkdggrn6/view?usp=drive_link)

**Task 1.12**

\-- Select the average price of each manufacturer's products, showing only the manufacturer's code.

[View output example](https://drive.google.com/file/d/1ND64l3tr5-Xcoq3biiI47OConI_93J8p/view?usp=drive_link)

**Task 1.13**

\-- Select the average price of each manufacturer's products, showing the manufacturer's name.

[View output example](https://drive.google.com/file/d/1TyXKKlGKAS_AjPIrd8F2uPiv_Z6m7F6-/view?usp=drive_link)

**Task 1.14**

\-- Select the names of manufacturers with an average product price larger than or equal to $150.

[View output example](https://drive.google.com/file/d/1eDQQZpr-Tar13V5QkZFuVCzvjySswskF/view?usp=drive_link)

**Task 1.15**

\-- Select the name and price of the cheapest product.

[View output example](https://drive.google.com/file/d/1JBXDM0uxIHoGJD_S2nhDghLwWsJP74BQ/view?usp=drive_link)

**Task 1.16**

\-- Select the name of each manufacturer along with the name and price of their most expensive product.

[View output example](https://drive.google.com/file/d/1OGweiGLK3QJ-YhWt6MoVOIZ64NLjtzCy/view?usp=drive_link)

**Task 1.17**

\-- Add a new product: Loudspeakers, $70, manufacturer 2.

There is no output for queries that manipulate the database in some way (create, update, delete). You can either use the Browse Data tab, or make a query to check you were successful.

[View example](https://drive.google.com/file/d/16epkqz9sOgydzalvsMALTRj16D6-4l-6/view?usp=drive_link)

**Task 1.18**

\-- Update the name of product 8 to "Laser Printer".

[View example](https://drive.google.com/file/d/1VeneBE5VVR63z3eI6ALrcgimXCiTxIwY/view?usp=drive_link)

**Task 1.19**

\-- Apply a 10% discount to all products.

[View example](https://drive.google.com/file/d/1wL-jZ6RA1ZEvar1q-f8PrjrwcxOOpu8g/view?usp=drive_link)

**Task 1.20**

\-- Apply a further 10% discount to all products with a price larger than or equal to $120.

[View example](https://drive.google.com/file/d/1HQWJwHLfuxg6azix_AeO8gKN7TmXtn9H/view?usp=drive_link)

## Task 2

Create a new database and run the following queries to create and populate the tables:

```sql
CREATE TABLE IF NOT EXISTS Departments (
    Code INTEGER,
    Name TEXT NOT NULL,
    Budget REAL NOT NULL,
    PRIMARY KEY (Code)   
);

CREATE TABLE IF NOT EXISTS Employees (
    SSN INTEGER,
    Name TEXT NOT NULL ,
    LastName TEXT NOT NULL ,
    Department INTEGER NOT NULL , 
    PRIMARY KEY (SSN)   
);
```

```sql
INSERT INTO Departments(Code,Name,Budget) VALUES
    (14,'IT',65000),
    (37,'Accounting',15000),
    (59,'Human Resources',240000),
    (77,'Research',55000);

INSERT INTO Employees(SSN,Name,LastName,Department) VALUES
    ('123234877','Michael','Rogers',14),
    ('152934485','Anand','Manikutty',14),
    ('222364883','Carol','Smith',37),
    ('326587417','Joe','Stevens',37),
    ('332154719','Mary-Anne','Foster',14),
    ('332569843','George','ODonnell',77),
    ('546523478','John','Doe',59),
    ('631231482','David','Smith',77),
    ('654873219','Zacary','Efron',59),
    ('745685214','Eric','Goldsmith',59),
    ('845657245','Elizabeth','Doe',14),
    ('845657246','Kumar','Swamy',14);
```

![Task2 schema](staticAsset/data/Module-1/Project-4/task2_schema.png "Task2 schema")

### Task 2.1

\-- Select the last names of all employees.

[View output example](https://drive.google.com/file/d/1iD_4EZrPydMDVjdYg34pAvaoYCuVXWJt/view?usp=drive_link)

### Task 2.2

\-- Select the last names of all employees, without duplicates.

[View output example](https://drive.google.com/file/d/1sKr1ZQSilL5bwK4dFAQtATzQqz6bIlbQ/view?usp=drive_link)

### Task 2.3

\-- Select all data from employees with the last name "Smith".

[View output example](https://drive.google.com/file/d/1UhuSLPKNx8ItdMLYa-ax63Nhs5dg03w2/view?usp=drive_link)

### Task 2.4

\-- Select all data from employees with the last names "Smith" or "Doe".

[View output example](https://drive.google.com/file/d/1iY7WJQWMrtFCqK9eM3oFfpZ32Dud-lEt/view?usp=drive_link)

### Task 2.5

\-- Select all data from employees that work in the department with code 14.

[View output example](https://drive.google.com/file/d/1vefE85aAPa5umyKFHhmBFAaHWTF07PVG/view?usp=drive_link)

### Task 2.6

\-- Select all data from employees that work in departments with codes 37 or 77.

[View output example](https://drive.google.com/file/d/1PmIyYjos2Tq2skN1lgXHR6jq5mXda8Wa/view?usp=drive_link)

### Task 2.7

\-- Select all data from employees whose last names begin with the letter "S".

[View output example](https://drive.google.com/file/d/1Y489Jp3w6DLqLPoK55MAGcRWWCVdtKxm/view?usp=drive_link)

### Task 2.8

\-- Select the sum of budgets from every department.

[View output example](https://drive.google.com/file/d/1Zeg5610ExKcYz_mM_yJPvN3AwXndQH_z/view?usp=drive_link)

### Task 2.9

\-- Select the number of employees in each department (show only the department code and the number of employees).

[View output example](https://drive.google.com/file/d/1kyXthIR-wwYAWDl_Hh1fZZjbDhV4-UTE/view?usp=drive_link)

### Task 2.10

\-- Select all data from employees, including the department data for each employee.

[View output example](https://drive.google.com/file/d/1qJcJoT9CHuh6yMz-OyOP2EmnSbXc0v_r/view?usp=drive_link)

### Task 2.11

\-- Select the names and last names of each employee, along with the name and budget of the employee's department.

[View output example](https://drive.google.com/file/d/1_O6oxghRletc6HmZZXEY0QxYDJ_8rDK5/view?usp=drive_link)

### Task 2.12

\-- Select the names and last names of employees working for departments with a budget greater than $60,000.

[View output example](https://drive.google.com/file/d/1cez3QpkBAh6lKede9oIePx6yH0fCnZe8/view?usp=drive_link)

### Task 2.13

\-- Select the departments with a budget larger than the average budget of all the departments.

[View output example](https://drive.google.com/file/d/1NI9GjDdHaIiBf8j4e7jZF9g0RcbGVVMx/view?usp=drive_link)

### Task 2.14

\-- Select the names of departments with more than two employees.

[View output example](https://drive.google.com/file/d/1C_Ft4E97nJlCJznRtewXaPCj8KnFzgUR/view?usp=drive_link)

### Task 2.15

\-- Select the names and last names of employees working for the two departments with lowest budgets.

[View output example](https://drive.google.com/file/d/1W5IoCkgDNyvztcBiWJ1NngcCteYi2Tfo/view?usp=drive_link)

### Task 2.16

\-- Add a new department called "Quality Assurance" with department code 11 and a budget of $40,000.

[View example](https://drive.google.com/file/d/1FHPcMYeK519eBDEBfcnQr5pHtaTF8JVy/view?usp=drive_link)

\-- Now also add an employee called "Mary Moore" in the new department, with SSN 847-21-9811.

[View example](https://drive.google.com/file/d/1vKL6Ppsdv8QwzOynmUSivFMpWYWPEd6P/view?usp=drive_link)

### Task 2.17

\-- Reduce the budget of all departments by 10%.

[View example](https://drive.google.com/file/d/1LGwBSe7qIS87Vif40kFJJYAm6-f8203o/view?usp=drive_link)

### Task 2.18

\-- Reassign all employees from the Research department (code 77) to the IT department (code 14).

[View example](https://drive.google.com/file/d/104r6HnXWKBr8lGkyfGmwULJdKhyzg4ZJ/view?usp=drive_link)

### Task 2.19

\-- Delete all employees in the IT department (code 14) from the employees table.

[View example](https://drive.google.com/file/d/1xAj_BpOac7zIwSxQNvnjFg4XmFwZWZ7j/view?usp=drive_link)

### Task 2.20

\-- Delete all employees who work in departments with a budget greater than or equal to $60,000.

[View example](https://drive.google.com/file/d/1SPS3yknwYfsXugorIGa7ZpIma8R3yn-k/view?usp=drive_link)

### Task 2.21

\-- Delete all remaining employees from the employees table, but make sure the table still exists.

[View example](https://drive.google.com/file/d/1PiOM5vmfYzGkihCtVHMXGmy6SIga_SYh/view?usp=drive_link)

## Task 3

```sql
CREATE TABLE Warehouses (
   Code INTEGER NOT NULL,
   Location TEXT NOT NULL ,
   Capacity INTEGER NOT NULL,
   PRIMARY KEY (Code)
 );

CREATE TABLE Boxes (
    Code TEXT NOT NULL,
    Contents TEXT NOT NULL ,
    Value REAL NOT NULL ,
    Warehouse INTEGER NOT NULL,
    PRIMARY KEY (Code)
 );
```

```sql
 INSERT INTO Warehouses(Code,Location,Capacity) VALUES
 (1,'Chicago',3),
 (2,'Chicago',4),
 (3,'New York',7),
 (4,'Los Angeles',2),
 (5,'San Francisco',8);
 
 INSERT INTO Boxes(Code,Contents,Value,Warehouse) VALUES
 ('0MN7','Rocks',180,3),
 ('4H8P','Rocks',250,1),
 ('4RT3','Scissors',190,4),
 ('7G3H','Rocks',200,1),
 ('8JN6','Papers',75,1),
 ('8Y6U','Papers',50,3),
 ('9J6F','Papers',175,2),
 ('LL08','Rocks',140,4),
 ('P0H6','Scissors',125,1),
 ('P2T6','Scissors',150,2),
 ('TU55','Papers',90,5);
```

![Task3 schema](staticAsset/data/Module-1/Project-4/task3_schema.png "Task3 schema")

### Task 3.1

\-- Select all warehouses.

[View output example](https://drive.google.com/file/d/1blfhyjo2QdannCYaoiIuzh3JZKKZsBFZ/view?usp=drive_link)

### Task 3.2

\-- Select all boxes with a value larger than $150.

[View output example](https://drive.google.com/file/d/1RLqjs8AEhBI4Mg_XUGdvuZE9IZl3GPVB/view?usp=drive_link)

### Task 3.3

\-- Select all distinct contents in all the boxes.

[View output example](https://drive.google.com/file/d/11DAvnhCAp_3GN-rgt5tmzeB2s54hqZY1/view?usp=drive_link)

### Task 3.4

\-- Select the average value of all boxes.

[View output example](https://drive.google.com/file/d/1fnUdu5Js0UeEBAavREq3wK8nIbu98nAc/view?usp=drive_link)

### Task 3.5

\-- Select the warehouse code and the average value of the boxes in each warehouse.

[View output example](https://drive.google.com/file/d/1_HqAsEPiE6Ay7SEXlAfCt6mkYbHIEv9b/view?usp=drive_link)

### Task 3.6

\-- Same as Task 3.5, but select only the warehouses where the average value of the boxes is greater than 150.

[View output example](https://drive.google.com/file/d/1OE0VZM4oKjROyGeV9Z2sJql93mcNpy1f/view?usp=drive_link)

### Task 3.7

\-- Select the code of each box, along with the location of the warehouse the box is located in.

[View output example](https://drive.google.com/file/d/1s54h4yyE9k_9z9eA4__ulvyaKeH9jbpw/view?usp=drive_link)

### Task 3.8

\-- Select the warehouse codes, along with the number of boxes in each warehouse.

[View output example](https://drive.google.com/file/d/1kszJ6uMnxCDstYRMXlEfe8vo6iyPWO97/view?usp=drive_link)

### Task 3.9

\-- Select the codes of all warehouses that are saturated (a warehouse is saturated if the number of boxes stored is larger than the warehouse capacity).

[View output example](https://drive.google.com/file/d/1M2D4yMfsyinaUvtPrGj3x0QQXTzRGnYU/view?usp=drive_link)

### Task 3.10

\-- Select the codes of all boxes in the warehouse located in Chicago.

[View output example](https://drive.google.com/file/d/1MKiV6beMYezLITRyxXdTW4fNO12U21Hd/view?usp=drive_link)

### Task 3.11

\-- Create a new warehouse in New York with a capacity for 3 boxes.

Remember: queries that manipulate the database won't give any output. Check the Browse Data tab, or make a new query to check if you succeeded.

[View example](https://drive.google.com/file/d/19o0VbnmtrHI1-TFGuRPOk_7WXBzST1Uv/view?usp=drive_link)

### Task 3.12

\-- Create a new box with code "H5RT", containing "Papers" with a value of $200, and located in warehouse 2.

[View example](https://drive.google.com/file/d/1QWEbty10tLwo_KpydSZ5Dwqvv54u4TwY/view?usp=drive_link)

### Task 3.13

\-- Reduce the value of all boxes by 15%.

[View example](https://drive.google.com/file/d/1_XMbopV7DDITfkw0z7ZOD8ahyCCgisKl/view?usp=drive_link)

### Task 3.14

\-- Delete all records of boxes from saturated warehouses.

[View example](https://drive.google.com/file/d/1wxs2vjcmU4qBGOy1LUKRLE5gPout-azS/view?usp=drive_link)

### Task 3.15

\-- Remove all boxes with a value lower than $100.

[View example](https://drive.google.com/file/d/1Eljy3FDPMu__FiReDf0tyJX4AIFJ2tpB/view?usp=drive_link)

### Task 3.16

\-- Add an Index for column "Warehouse" in the Boxes table (**NOTE**: indexes should NOT be used on small tables in practice).

[View example](https://drive.google.com/file/d/1wUUwAEM6iqp_PIxSaGz1GxH_1VvEpi44/view?usp=drive_link)

### Task 3.17

\-- Print all existing indexes

[View output example](https://drive.google.com/file/d/13ykUSOAlPv0oX6qtppdQtuAIDkUc8kYS/view?usp=drive_link)

### Task 3.18

\-- Drop the index you just created

[View example](https://drive.google.com/file/d/16FuqEpR-uNKkVXKnrtBDo7wtMOj3CeHp/view?usp=drive_link)

## Task 4

```sql
CREATE TABLE IF NOT EXISTS Movies (
	Code INTEGER,
	Title TEXT NOT NULL,
	Rating TEXT,
	PRIMARY KEY (Code)
);

CREATE TABLE IF NOT EXISTS MovieTheaters (
	Code INTEGER,
	Name TEXT NOT NULL,
	Movie INTEGER,
	PRIMARY KEY (Code)
);
```

```sql
INSERT INTO Movies (Code, Title, Rating) VALUES 
    (1, 'Citizen Kane', 'PG'),
    (2, 'Singin'' in the Rain', 'G'),
    (3, 'The Wizard of Oz', 'G'),
    (4, 'The Quiet Man', NULL),
    (5, 'North by Northwest', NULL),
    (6, 'The Last Tango in Paris', 'NC-17'),
    (7, 'Some Like it Hot', 'PG-13'),
    (8, 'A Night at the Opera', NULL);

INSERT INTO MovieTheaters (Code, Name, Movie) VALUES
    (1, 'Odeon', 5),
    (2, 'Imperial', 1),
    (3, 'Majestic', NULL),
    (4, 'Royale', 6),
    (5, 'Paraiso', 3),
    (6, 'Nikelodeon', NULL);
```

![Task4 schema](staticAsset/data/Module-1/Project-4/task4_schema.png "Task4 schema")

### Task 4.1

\-- Select the titles of all movies.

[View output example](https://drive.google.com/file/d/17rbb-FOMgb3u5AGJhQmI-ZpYzhjHyc3n/view?usp=drive_link)

### Task 4.2

\-- Show all the distinct ratings in the database.

[View output example](https://drive.google.com/file/d/1W91jNIeuliojWu-jqsU0SNuvNzj7UI5s/view?usp=drive_link)

### Task 4.3

\-- Show all unrated movies.

[View output example](https://drive.google.com/file/d/1njolYssxgGixMii9JuCcjyaFfAA_-HVl/view?usp=drive_link)

### Task 4.4

\-- Select all movie theatres that are not currently showing a movie.

[View output example](https://drive.google.com/file/d/1TzFXQMZAFMLk7NCFk5EbB17eciZ45KYA/view?usp=drive_link)

### Task 4.5

\-- Select all data from all movie theaters and, additionally, the data from the movie that is being shown in the theater (if one is being shown).

[View output example](https://drive.google.com/file/d/1-Ej5XztxCiJphGniqCnfSFHLJk5guyMM/view?usp=drive_link)

### Task 4.6

\-- Select all data from all movies and, if that movie is being shown in a theater, show the data from the theater.

[View output example](https://drive.google.com/file/d/1ETfuQkGbDpCRs5Dz8YQOghn62AspXBjc/view?usp=drive_link)

### Task 4.7

\-- Show the titles of movies not currently being shown in any theaters.

[View output example](https://drive.google.com/file/d/1uxzhAxOGpxNHuQmJW1JOMlhS9gVLuEAm/view?usp=drive_link)

### Task 4.8

\-- Add an unrated movie with the title: "One, Two, Three".

[View example](https://drive.google.com/file/d/1erlk0cF3BLIV_KT89mxYi5bNgvJtonl_/view?usp=drive_link)

### Task 4.9

\-- Set the rating of all unrated movies to "G".

[View example](https://drive.google.com/file/d/1YU_w_caDcar3LrLweI7EvcOtKhflkcQ6/view?usp=drive_link)

### Task 4.10

\-- Remove movie theaters showing movies rated "NC-17".

[View example](https://drive.google.com/file/d/1Ssr7pQnO1I97xpbQ0X8Nb3bYzH9nFR0R/view?usp=drive_link)

## Task 5

```sql
CREATE TABLE Pieces (
    Code INTEGER NOT NULL,
    Name TEXT NOT NULL,
    PRIMARY KEY (Code)
 );

CREATE TABLE Providers (
    Code TEXT NOT NULL,  
    Name TEXT NOT NULL,
    PRIMARY KEY (Code) 
 );

CREATE TABLE Provides (
    Piece INTEGER, 
    Provider TEXT, 
    Price INTEGER NOT NULL,
    PRIMARY KEY(Piece, Provider) 
 );
```

```sql
INSERT INTO Providers (Code, Name) VALUES 
    ('HAL', 'Clarke Enterprises'),
    ('RBT', 'Susan Calvin Corp.'),
    ('TNBC', 'Skellington Supplies');

INSERT INTO Pieces (Code, Name) VALUES
    (1, 'Sprocket'),
    (2, 'Screw'),
    (3, 'Nut'),
    (4, 'Bolt');

INSERT INTO Provides (Piece, Provider, Price) VALUES
    (1, 'HAL', 10),
    (1, 'RBT', 15),
    (2, 'HAL', 20),
    (2, 'RBT', 15),
    (2, 'TNBC', 14),
    (3, 'RBT', 50),
    (3, 'TNBC', 45), 
    (4, 'HAL', 5),
    (4, 'RBT', 7);
```

![Task5 schema](staticAsset/data/Module-1/Project-4/task5_schema.png "Task5 schema")

### Task 5.1

\-- Select the names of all the pieces.

[View output example](https://drive.google.com/file/d/1q3d01DHpKaFBZMY-Qaag9k46g3fbYrC3/view?usp=drive_link)

### Task 5.2

\-- Select all the providers' data.

[View output example](https://drive.google.com/file/d/1ckJFrJhSwgR9pTCFFtAv6t75kVzJEDu7/view?usp=drive_link)

### Task 5.3

\-- Obtain the average price of each piece (show only the piece code and the average price).

[View output example](https://drive.google.com/file/d/1nUbV2z180H8kv3LGvi0IiMb1ykhmjrg9/view?usp=drive_link)

### Task 5.4

\-- Obtain the names of all providers who supply piece with Code 1.

[View output example](https://drive.google.com/file/d/1niR8hOfU3Ul8_bxV-2-ZtLnDn5Lj578P/view?usp=drive_link)

### Task 5.5

\-- Select the names of pieces provided by the provider with code "HAL".

[View output example](https://drive.google.com/file/d/1EE0ZYQceiSPPsazEohJdSNUKuffnxzYX/view?usp=drive_link)

### Task 5.6

\-- Add an entry to the database to indicate that "Skellington Supplies" (code "TNBC") will provide sprockets (code "1") for 15 cents each.

[View example](https://drive.google.com/file/d/1GtQGKcJ2bx5RdDeq37vrlSnnsfSMquA_/view?usp=drive_link)

### Task 5.7

\-- For each piece, find the most expensive offering of that piece and include the piece name, provider name, and price

[View output example](https://drive.google.com/file/d/1A-hhzGhr8hKmOzmF-ij-6UamZYAP00aq/view?usp=drive_link)

\-- (OPTIONAL: As there could be more than one provider who supply the same piece at the most expensive price,
\-- show _all_ providers who supply at the most expensive price).

[View output example](https://drive.google.com/file/d/1NaCYoLo-cED1morj1ULpbk7GLVMwshwA/view?usp=drive_link)

### Task 5.8

\-- Increase all prices by one cent.

[View example](https://drive.google.com/file/d/19IkSxOiZ2bvzi7bItG6ccvC9ATC8fxDT/view?usp=drive_link)

### Task 5.9

\-- Update the database to reflect that "Susan Calvin Corp." (code "RBT") will not supply bolts (code 4).

[View example](https://drive.google.com/file/d/1Xvd9A1uUcWEzUG_f3FJ7EgX-QtwAxNQ6/view?usp=drive_link)

### Task 5.10

\-- Update the database to reflect that "Susan Calvin Corp." (code "RBT") will not supply _any_ pieces (the provider should still remain in the database).

[View example](https://drive.google.com/file/d/1h3FYrx03xJi5GtJ9D-0lImUBK2H8bNnD/view?usp=drive_link)

## Task 6

```sql
CREATE TABLE Scientists (
  SSN INTEGER,
  Name TEXT NOT NULL,
  Primary Key (SSN)
);

CREATE TABLE Projects (
  Code TEXT,
  Name TEXT NOT NULL,
  Primary Key (Code)
);
	
CREATE TABLE AssignedTo (
  Scientist INTEGER NOT NULL,
  Project TEXT NOT NULL,
  Hours INTEGER,
  Primary Key (Scientist, Project)
);
```

```sql
INSERT INTO Scientists(SSN,Name) 
VALUES
    (123234877,'Michael Rogers'),
    (152934485,'Anand Manikutty'),
    (222364883, 'Carol Smith'),
    (326587417,'Joe Stevens'),
    (332154719,'Mary-Anne Foster'),	
    (332569843,'George ODonnell'),
    (546523478,'John Doe'),
    (631231482,'David Smith'),
    (654873219,'Zacary Efron'),
    (745685214,'Eric Goldsmith'),
    (845657245,'Elizabeth Doe'),
    (845657246,'Kumar Swamy');

INSERT INTO Projects ( Code,Name)
VALUES 
    ('AeH1','Winds: Studying Bernoullis Principle'),
    ('AeH2','Aerodynamics and Bridge Design'),
    ('AeH3','Aerodynamics and Gas Mileage'),
    ('AeH4','Aerodynamics and Ice Hockey'),
    ('AeH5','Aerodynamics of a Football'),
    ('AeH6','Aerodynamics of Air Hockey'),
    ('Ast1','A Matter of Time'),
    ('Ast2','A Puzzling Parallax'),
    ('Ast3','Build Your Own Telescope'),
    ('Bte1','Juicy: Extracting Apple Juice with Pectinase'),
    ('Bte2','A Magnetic Primer Designer'),
    ('Bte3','Bacterial Transformation Efficiency'),
    ('Che1','A Silver-Cleaning Battery'),
    ('Che2','A Soluble Separation Solution');

INSERT INTO AssignedTo ( Scientist, Project, Hours)
VALUES 
    (123234877,'AeH1', 156),
    (152934485,'AeH3',189),
    (222364883,'Ast3', 256),	   
    (326587417,'Ast3', 789),
    (332154719,'Bte1', 98),
    (546523478,'Che1',89),
    (631231482,'Ast3',112),
    (654873219,'Che1', 299),
    (745685214,'AeH3', 6546),
    (845657245,'Ast1', 321),
    (845657246,'Ast2', 9684),
    (332569843,'AeH4', 321);
```

![Task6 schema](staticAsset/data/Module-1/Project-4/task6_schema.png "Task6 schema")

### Task 6.1

\-- List all the scientists' names, their projects' names,

[View example output](https://drive.google.com/file/d/1iEXr40QF1Gyf90k0MrNMKOQl3QQdZOZC/view?usp=drive_link)

\-- and the hours worked on their project,

[View example output](https://drive.google.com/file/d/1cSJb415Sh0ztHa_fmbmmUS9cZC8MjTc-/view?usp=drive_link)

\-- order alphabetically by project name, then scientist name.

[View example output](https://drive.google.com/file/d/1uikmXZc0FSTNzipCAS4-J_k_l0LUNd_-/view?usp=drive_link)

### Task 6.2

\-- Now list the project names and total hours worked on each, ordered from most to least total hours.

[View example output](https://drive.google.com/file/d/1r_L08Em5_DhiueePM6BEmofPnStuYXZq/view?usp=drive_link)

### Task 6.3

\-- Select the project names which do not have any scientists currently assigned to them.

[View example output](https://drive.google.com/file/d/1JMxXikqEwRmPStgi35tHR0s9kF-QrWI6/view?usp=drive_link)
