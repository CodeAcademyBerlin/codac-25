---
title: SQL Tasks 7-10
---


\<!-- Download the file from \[this link]\(https://docs.google.com/document/d/1dUt7lbttwkC1AUrAdtHHXA0B\_Mcmvcyb/edit?usp=sharing\&ouid=112478853022456914671\&rtpof=true\&sd=true) and continue with the next days of the challenge. -->

**Repeat the process from Sprint 1 for the following Tasks (try to complete one task per day)**

## Task 7

```sql
CREATE TABLE Employee (
  EmployeeID INTEGER,
  Name TEXT NOT NULL,
  Position TEXT NOT NULL,
  Salary REAL NOT NULL,
  Remarks TEXT,
  PRIMARY KEY (EmployeeID)
); 

CREATE TABLE Planet (
  PlanetID INTEGER,
  Name TEXT NOT NULL,
  Coordinates REAL NOT NULL,
  PRIMARY KEY (PlanetID)
); 

CREATE TABLE Shipment (
  ShipmentID INTEGER,
  Date DATE,
  Manager INTEGER NOT NULL,
  Planet INTEGER NOT NULL,
  PRIMARY KEY (ShipmentID)
);

CREATE TABLE Has_Clearance (
  Employee INTEGER NOT NULL,
  Planet INTEGER NOT NULL,
  Level INTEGER NOT NULL,
  PRIMARY KEY(Employee, Planet)
); 

CREATE TABLE Client (
  AccountNumber INTEGER,
  Name TEXT NOT NULL,
  PRIMARY KEY (AccountNumber)
);
  
CREATE TABLE Package (
  Shipment INTEGER NOT NULL,
  PackageNumber INTEGER NOT NULL,
  Contents TEXT NOT NULL,
  Weight REAL NOT NULL,
  Sender INTEGER NOT NULL,
  Recipient INTEGER NOT NULL,
  PRIMARY KEY(Shipment, PackageNumber)
);
```

```sql
INSERT INTO Client VALUES
(1, 'Zapp Brannigan'),
(2, "Al Gore's Head"),
(3, 'Barbados Slim'),
(4, 'Ogden Wernstrom'),
(5, 'Leo Wong'),
(6, 'Lrrr'),
(7, 'John Zoidberg'),
(8, 'John Zoidfarb'),
(9, 'Morbo'),
(10, 'Judge John Whitey'),
(11, 'Calculon');

INSERT INTO Employee VALUES
(1, 'Phillip J. Fry', 'Delivery boy', 7500.0, 'Not to be confused with the Philip J. Fry from Hovering Squid World 97a'),
(2, 'Turanga Leela', 'Captain', 10000.0, NULL),
(3, 'Bender Bending Rodriguez', 'Robot', 7500.0, NULL),
(4, 'Hubert J. Farnsworth', 'CEO', 20000.0, NULL),
(5, 'John A. Zoidberg', 'Physician', 25.0, NULL),
(6, 'Amy Wong', 'Intern', 5000.0, NULL),
(7, 'Hermes Conrad', 'Bureaucrat', 10000.0, NULL),
(8, 'Scruffy Scruffington', 'Janitor', 5000.0, NULL);


INSERT INTO Planet VALUES
(1, 'Omicron Persei 8', 89475345.3545),
(2, 'Decapod X', 65498463216.3466),
(3, 'Mars', 32435021.65468),
(4, 'Omega III', 98432121.5464),
(5, 'Tarantulon VI', 849842198.354654),
(6, 'Cannibalon', 654321987.21654),
(7, 'DogDoo VII', 65498721354.688),
(8, 'Nintenduu 64', 6543219894.1654),
(9, 'Amazonia', 65432135979.6547);

INSERT INTO Has_Clearance VALUES
(1, 1, 2),
(1, 2, 3),
(2, 3, 2),
(2, 4, 4),
(3, 5, 2),
(3, 6, 4),
(4, 7, 1);

INSERT INTO Shipment VALUES
(1, '3004/05/11', 1, 2),
(2, '3004/05/11', 1, 2),
(3, NULL, 2, 3),
(4, NULL, 2, 4),
(5, NULL, 7, 5);

INSERT INTO Package VALUES
(1, 1, 'Undeclared', 1.5, 1, 2),
(2, 1, 'Undeclared', 10.0, 2, 3),
(2, 2, 'A bucket of krill', 2.0, 8, 7),
(3, 1, 'Undeclared', 15.0, 3, 4),
(3, 2, 'Undeclared', 3.0, 5, 1),
(3, 3, 'Undeclared', 7.0, 2, 3),
(4, 1, 'Undeclared', 5.0, 4, 5),
(4, 2, 'Undeclared', 27.0, 1, 2),
(5, 1, 'Undeclared', 100.0, 5, 1);
```

![Task7 schema](staticAsset/data/Module-1/Project-4/task7_schema.png "Task7 schema")

### Task 7.1

\-- Select the name of the client that received a 1.5kg package.

[View example output](https://drive.google.com/file/d/1LjEzjPd82rNevK87Exrb3quZdpoRde_0/view?usp=drive_link)

### Task 7.2

\-- What is the total weight of all the packages sent by that same client?

[View example output](https://drive.google.com/file/d/1f-dQqKyXzhALXqpzcWo_sGAqn1gc4kop/view?usp=drive_link)

### Task 7.3

\-- Select the names of employees who have clearance level 4 or higher.

[View example output](https://drive.google.com/file/d/1HHcnWc2FShzhnOoCaamC6QLJx7-NuMwr/view?usp=drive_link)

### Task 7.4

\-- Rank all employees based on their salary in descending order, showing their names and positions alongside their rank. (Try using a Window Function if you are up to the challenge!)

[View example output](https://drive.google.com/file/d/1EaXqch0bUry4jIyoSUrg9nCMPCjcCI4Q/view?usp=drive_link)

### Task 7.5

\-- Create a CTE to calculate the total weight of packages sent to each planet, then join it with the Planet table to select the planet names and their corresponding total package weights.

[View example output](https://drive.google.com/file/d/1xS9BuMJtDvJkuUUcMjLTxR3l_qIRtZGR/view?usp=drive_link)

### Task 7.6

\-- Select the names of employees who have shipped packages to planets that no other employee has shipped to.

[View example output](https://drive.google.com/file/d/1r2wIntHGzT4yd-co5xfj7uDOFdGDJt7Z/view?usp=drive_link)

### Task 7.7

\-- Select the names of planets, along with the number of shipments made to each planet.

[View example output](https://drive.google.com/file/d/1F67hvL11zOcJF-Ki4rHJQRcVLM7BRsBf/view?usp=drive_link)

\-- Do the same, but exclude planets where the total weight of packages sent is less than 20 units.

[View example output](https://drive.google.com/file/d/10CWpLh16aYqmuRXjBPDb838mzzEJ-CuQ/view?usp=drive_link)

## Task 8

```sql
CREATE TABLE Physician (
  EmployeeID INTEGER NOT NULL,
  Name TEXT NOT NULL,
  Position TEXT NOT NULL,
  SSN INTEGER NOT NULL,
  PRIMARY KEY (EmployeeID)
); 

CREATE TABLE Department (
  DepartmentID INTEGER NOT NULL,
  Name TEXT NOT NULL,
  Head INTEGER NOT NULL,
  PRIMARY KEY (DepartmentID)
);

CREATE TABLE Affiliated_With (
  Physician INTEGER NOT NULL,
  Department INTEGER NOT NULL,
  PrimaryAffiliation BOOLEAN NOT NULL,
  PRIMARY KEY(Physician, Department)
);

CREATE TABLE Procedures (
  Code INTEGER NOT NULL,
  Name TEXT NOT NULL,
  Cost REAL NOT NULL,
  PRIMARY KEY (Code)
);

CREATE TABLE Trained_In (
  Physician INTEGER NOT NULL,
  Treatment INTEGER NOT NULL,
  CertificationDate DATETIME NOT NULL,
  CertificationExpires DATETIME NOT NULL,
  PRIMARY KEY(Physician, Treatment)
);

CREATE TABLE Patient (
  SSN INTEGER NOT NULL,
  Name TEXT NOT NULL,
  Address TEXT NOT NULL,
  Phone TEXT NOT NULL,
  InsuranceID INTEGER NOT NULL,
  PCP INTEGER NOT NULL,
  PRIMARY KEY (SSN)
);

CREATE TABLE Nurse (
  EmployeeID INTEGER NOT NULL,
  Name TEXT NOT NULL,
  Position TEXT NOT NULL,
  Registered BOOLEAN NOT NULL,
  SSN INTEGER NOT NULL,
  PRIMARY KEY (EmployeeID)
);

CREATE TABLE Appointment (
  AppointmentID INTEGER NOT NULL,
  Patient INTEGER NOT NULL,
  PrepNurse INTEGER,
  Physician INTEGER NOT NULL,
  Start DATETIME NOT NULL,
  End DATETIME NOT NULL,
  ExaminationRoom TEXT NOT NULL,
  PRIMARY KEY (AppointmentID)
);

CREATE TABLE Medication (
  Code INTEGER NOT NULL,
  Name TEXT NOT NULL,
  Brand TEXT NOT NULL,
  Description TEXT NOT NULL,
  PRIMARY KEY(Code)
);

CREATE TABLE Prescribes (
  Physician INTEGER NOT NULL,
  Patient INTEGER NOT NULL,
  Medication INTEGER NOT NULL,
  Date DATETIME NOT NULL,
  Appointment INTEGER,
  Dose TEXT NOT NULL,
  PRIMARY KEY(Physician, Patient, Medication, Date)
);

CREATE TABLE Block (
  Floor INTEGER NOT NULL,
  Code INTEGER NOT NULL,
  PRIMARY KEY(Floor, Code)
); 

CREATE TABLE Room (
  Number INTEGER NOT NULL,
  Type TEXT NOT NULL,
  BlockFloor INTEGER NOT NULL,
  BlockCode INTEGER NOT NULL,
  Unavailable BOOLEAN NOT NULL,
  PRIMARY KEY(Number)
);

CREATE TABLE On_Call (
  Nurse INTEGER NOT NULL,
  BlockFloor INTEGER NOT NULL,
  BlockCode INTEGER NOT NULL,
  Start DATETIME NOT NULL,
  End DATETIME NOT NULL,
  PRIMARY KEY(Nurse, BlockFloor, BlockCode, Start, End)
);

CREATE TABLE Stay (
  StayID INTEGER NOT NULL,
  Patient INTEGER NOT NULL,
  Room INTEGER NOT NULL,
  Start DATETIME NOT NULL,
  End DATETIME NOT NULL,
  PRIMARY KEY(StayID)
);

CREATE TABLE Undergoes (
  Patient INTEGER NOT NULL,
  Procedure INTEGER NOT NULL,
  Stay INTEGER NOT NULL,
  Date DATETIME NOT NULL,
  Physician INTEGER NOT NULL,
  AssistingNurse INTEGER,
  PRIMARY KEY(Patient, Procedure, Stay, Date)
);
```

```sql
INSERT INTO Physician VALUES
(1,'John Dorian','Staff Internist',111111111),
(2,'Elliot Reid','Attending Physician',222222222),
(3,'Christopher Turk','Surgical Attending Physician',333333333),
(4,'Percival Cox','Senior Attending Physician',444444444),
(5,'Bob Kelso','Head Chief of Medicine',555555555),
(6,'Todd Quinlan','Surgical Attending Physician',666666666),
(7,'John Wen','Surgical Attending Physician',777777777),
(8,'Keith Dudemeister','MD Resident',888888888),
(9,'Molly Clock','Attending Psychiatrist',999999999);

INSERT INTO Department VALUES
(1,'General Medicine',4),
(2,'Surgery',7),
(3,'Psychiatry',9);

INSERT INTO Affiliated_With VALUES
(1,1,1),
(2,1,1),
(3,1,0),
(3,2,1),
(4,1,1),
(5,1,1),
(6,2,1),
(7,1,0),
(7,2,1),
(8,1,1),
(9,3,1);

INSERT INTO Procedures VALUES
(1,'Reverse Rhinopodoplasty',1500.0),
(2,'Obtuse Pyloric Recombobulation',3750.0),
(3,'Folded Demiophtalmectomy',4500.0),
(4,'Complete Walletectomy',10000.0),
(5,'Obfuscated Dermogastrotomy',4899.0),
(6,'Reversible Pancreomyoplasty',5600.0),
(7,'Follicular Demiectomy',25.0);

INSERT INTO Patient VALUES
(100000001,'John Smith','42 Foobar Lane','555-0256',68476213,1),
(100000002,'Grace Ritchie','37 Snafu Drive','555-0512',36546321,2),
(100000003,'Random J. Patient','101 Omgbbq Street','555-1204',65465421,2),
(100000004,'Dennis Doe','1100 Foobaz Avenue','555-2048',68421879,3);

INSERT INTO Nurse VALUES
(101,'Carla Espinosa','Head Nurse',1,111111110),
(102,'Laverne Roberts','Nurse',1,222222220),
(103,'Paul Flowers','Nurse',0,333333330);

INSERT INTO Appointment VALUES
(13216584,100000001,101,1,'2008-04-24 10:00','2008-04-24 11:00','A'),
(26548913,100000002,101,2,'2008-04-24 10:00','2008-04-24 11:00','B'),
(36549879,100000001,102,1,'2008-04-25 10:00','2008-04-25 11:00','A'),
(46846589,100000004,103,4,'2008-04-25 10:00','2008-04-25 11:00','B'),
(59871321,100000004,NULL,4,'2008-04-26 10:00','2008-04-26 11:00','C'),
(69879231,100000003,103,2,'2008-04-26 11:00','2008-04-26 12:00','C'),
(76983231,100000001,NULL,3,'2008-04-26 12:00','2008-04-26 13:00','C'),
(86213939,100000004,102,9,'2008-04-27 10:00','2008-04-21 11:00','A'),
(93216548,100000002,101,2,'2008-04-27 10:00','2008-04-27 11:00','B');

INSERT INTO Medication VALUES
(1,'Procrastin-X','X','N/A'),
(2,'Thesisin','Foo Labs','N/A'),
(3,'Awakin','Bar Laboratories','N/A'),
(4,'Crescavitin','Baz Industries','N/A'),
(5,'Melioraurin','Snafu Pharmaceuticals','N/A');

INSERT INTO Prescribes VALUES
(1,100000001,1,'2008-04-24 10:47',13216584,'5'),
(9,100000004,2,'2008-04-27 10:53',86213939,'10'),
(9,100000004,2,'2008-04-30 16:53',NULL,'5');

INSERT INTO Block VALUES
(1,1),
(1,2),
(1,3),
(2,1),
(2,2),
(2,3),
(3,1),
(3,2),
(3,3),
(4,1),
(4,2),
(4,3);

INSERT INTO Room VALUES
(101,'Single',1,1,0),
(102,'Single',1,1,0),
(103,'Single',1,1,0),
(111,'Single',1,2,0),
(112,'Single',1,2,1),
(113,'Single',1,2,0),
(121,'Single',1,3,0),
(122,'Single',1,3,0),
(123,'Single',1,3,0),
(201,'Single',2,1,1),
(202,'Single',2,1,0),
(203,'Single',2,1,0),
(211,'Single',2,2,0),
(212,'Single',2,2,0),
(213,'Single',2,2,1),
(221,'Single',2,3,0),
(222,'Single',2,3,0),
(223,'Single',2,3,0),
(301,'Single',3,1,0),
(302,'Single',3,1,1),
(303,'Single',3,1,0),
(311,'Single',3,2,0),
(312,'Single',3,2,0),
(313,'Single',3,2,0),
(321,'Single',3,3,1),
(322,'Single',3,3,0),
(323,'Single',3,3,0),
(401,'Single',4,1,0),
(402,'Single',4,1,1),
(403,'Single',4,1,0),
(411,'Single',4,2,0),
(412,'Single',4,2,0),
(413,'Single',4,2,0),
(421,'Single',4,3,1),
(422,'Single',4,3,0),
(423,'Single',4,3,0);

INSERT INTO On_Call VALUES
(101,1,1,'2008-11-04 11:00','2008-11-04 19:00'),
(101,1,2,'2008-11-04 11:00','2008-11-04 19:00'),
(102,1,3,'2008-11-04 11:00','2008-11-04 19:00'),
(103,1,1,'2008-11-04 19:00','2008-11-05 03:00'),
(103,1,2,'2008-11-04 19:00','2008-11-05 03:00'),
(103,1,3,'2008-11-04 19:00','2008-11-05 03:00');

INSERT INTO Stay VALUES
(3215,100000001,111,'2008-05-01','2008-05-04'),
(3216,100000003,123,'2008-05-03','2008-05-14'),
(3217,100000004,112,'2008-05-02','2008-05-03');

INSERT INTO Undergoes VALUES
(100000001,6,3215,'2008-05-02',3,101),
(100000001,2,3215,'2008-05-03',7,101),
(100000004,1,3217,'2008-05-07',3,102),
(100000004,5,3217,'2008-05-09',6,NULL),
(100000001,7,3217,'2008-05-10',7,101),
(100000004,4,3217,'2008-05-13',3,103);

INSERT INTO Trained_In VALUES
(3,1,'2008-01-01','2008-12-31'),
(3,2,'2008-01-01','2008-12-31'),
(3,5,'2008-01-01','2008-12-31'),
(3,6,'2008-01-01','2008-12-31'),
(3,7,'2008-01-01','2008-12-31'),
(6,2,'2008-01-01','2008-12-31'),
(6,5,'2007-01-01','2007-12-31'),
(6,6,'2008-01-01','2008-12-31'),
(7,1,'2008-01-01','2008-12-31'),
(7,2,'2008-01-01','2008-12-31'),
(7,3,'2008-01-01','2008-12-31'),
(7,4,'2008-01-01','2008-12-31'),
(7,5,'2008-01-01','2008-12-31'),
(7,6,'2008-01-01','2008-12-31'),
(7,7,'2008-01-01','2008-12-31');
```

![Task8 schema](staticAsset/data/Module-1/Project-4/task8_schema.png "Task8 schema")

### Task 8.1

\-- Select the names of all physicians that have performed a medical procedure they have _never_ been certified to perform.

[View example output](https://drive.google.com/file/d/1bi_MYPKaLILT5SFjnfzqPvWTmwQ0DuNP/view?usp=drive_link)

### Task 8.2

\-- Same as the previous query, but include the following information in the results: Physician name, name of procedure, date when the procedure was carried out, name of the patient the procedure was carried out on.

[View example output](https://drive.google.com/file/d/123R5Xk4y9GXOORs43wGSjf-rAa_iv8Wt/view?usp=drive_link)

### Task 8.3

\-- Select the names of all physicians that have performed a medical procedure that they are certified to perform, but the procedure was performed at a date (Undergoes.Date) _after_ the physician's certification expired (Trained\_In.CertificationExpires).

[View example output](https://drive.google.com/file/d/1sQCcar-HcSABBpZnqWDxtdgRkBscD--a/view?usp=drive_link)

### Task 8.4

\-- Same as the previous query, but include the following information in the results: Physician name, name of procedure, date when the procedure was carried out, name of the patient the procedure was carried out on, and date when the certification expired.

[View example output](https://drive.google.com/file/d/1obBa92ePIc10zoHANy8IeZRiCPb657mj/view?usp=drive_link)

### Task 8.5

\-- Select the information for appointments where a patient met with a physician other than his/her primary care physician. Show the following information: Patient name, physician name, nurse name (if any), start and end time of appointment, examination room, and the name of the patient's primary care physician.

[View example output](https://drive.google.com/file/d/1EF-xa2e4CNIXCVmpAZsqSn9KI-0joNBa/view?usp=drive_link)

### Task 8.6

\-- The Patient field in Undergoes is redundant, since we can obtain it from the Stay table. There are no constraints in force to prevent inconsistencies between these two tables. More specifically, the Undergoes table may include a row where the patient ID does not match the one we would obtain from the Stay table through the Undergoes (Stay foreign key)

\-- Select all rows from Undergoes that exhibit this inconsistency.

[View example output](https://drive.google.com/file/d/1dBFmLG_hD5B15dxGh-1nrC0vPq3g4V9T/view?usp=drive_link)

### Task 8.7

\-- Select the names of all the nurses who have ever been on call for room 123.

[View example output](https://drive.google.com/file/d/1GM3a24uw7hv9j5rJkBgos1ybmNNNSTrC/view?usp=drive_link)

### Task 8.8

\-- The hospital has several examination rooms where appointments take place. Obtain the number of appointments that have taken place in each examination room.

[View example output](https://drive.google.com/file/d/1Sihn97X5SPhS7v0kXb3vlfOzjEMJJ0vs/view?usp=drive_link)

### Task 8.9

\-- Select the names of all patients, and the name of their primary care physicians.

[View example output](https://drive.google.com/file/d/1kQXFaTckVSKzJj8YDu6L7gahvErwUWrG/view?usp=drive_link)

\-- Do the same, but only for patients that have been prescribed some medication by his/her primary care physician.

[View example output](https://drive.google.com/file/d/1FcZtLKYimQggGjbUeAe00pnc2qGZVkvc/view?usp=drive_link)

\-- Now only for patients that have undergone a procedure with a cost larger that $5,000.

[View example output](https://drive.google.com/file/d/128zJkeXIBp1-8HfYyNN0wtlGSY6I_7rI/view?usp=drive_link)

\-- Now only for patients that have had at least two appointments where the nurse who prepared the appointment was a registered nurse.

[View example output](https://drive.google.com/file/d/1P76WUPBym2K6edcHw6p7EhBclZ3SWL43/view?usp=drive_link)

\-- Now only for patients whose primary care physician is not the head of any department.

[View example output](https://drive.google.com/file/d/1APW8BElXLxR8SybP-7hfB5_o1LtTLE7P/view?usp=drive_link)

## Task 9

Download [this csv file](https://drive.google.com/file/d/1HP1CgKbnNH9MTTk_KyJio_ZWn5jQJoUU/view?usp=drive_link), then follow the steps in the following video to create a database and import the data from the csv into an SQLite database.

\<iframe style="aspect-ratio: 16/9; width: 90%" src="https://www.youtube.com/embed/TOqI-KiTBKU?si=NStwZaec1Q8nWuQr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>\</iframe>

### Task 9.1

\-- Select the package name and how many times they're downloaded. Order by highest to lowest number of times downloaded.

[View example output](https://drive.google.com/file/d/1Bxo_oTtYpELlCmeom1sH01i5JFL0-Z8Z/view?usp=drive_link)

### Task 9.2

\-- Select the package ranking (based on how many times it was downloaded) during 9AM to 11AM

[View example output](https://drive.google.com/file/d/1F35ZgQixJSAmT90yWUzQ2GR23mRpaZlH/view?usp=drive_link)

### Task 9.3

\-- How many records (downloads) are from China ("CN"), Japan("JP") or Singapore ("SG")?

[View example output](https://drive.google.com/file/d/1P9QItm_7E5UuViYbupJ7cxwmm8GNsdUI/view?usp=drive_link)

### Task 9.4

\-- Select the countries with more downloads than the downloads from China ("CN")

[View example output](https://drive.google.com/file/d/11MFK5Yu1r76w-2kCHOQDNu98iJMvZG88/view?usp=drive_link)

### Task 9.5

\-- Calculate the length (number of letters) of each package name for packages which appear only once,

[View example output](https://drive.google.com/file/d/1pykWQgqj63zDterL7n6HOxJOwZWWGcXY/view?usp=drive_link)

\-- In the same query, also show the average length of all the packages which appear only once.

[View example output](https://drive.google.com/file/d/1yJIz_GR0qkzkgE5EFUTP6ITA4sNZxlXf/view?usp=drive_link)

### Task 9.6

\-- Select the package name and download count for the package whose download count ranks 2nd.

[View example output](https://drive.google.com/file/d/1PORfazNPpG20oFkZnnO4e1Owa8wGpnwE/view?usp=drive_link)

### Task 9.7

\-- Select the name of the package with a download count higher than 1000.

[View example output](https://drive.google.com/file/d/1iEr16wUPVo2L-5J-36ymUPO7UPKyybo7/view?usp=drive_link)

### Task 9.8

\-- The field "r\_os" is the operating system of the users. Select the system, the relevant counts, and the proportion (in percentage).

[View example output](https://drive.google.com/file/d/1Lx-AV7_Jc_R-hWXRDRUVco5NDWhhVr0-/view?usp=drive_link)

\-- Do the same, but see if you can find a way to ignore the version variations (optional).

[View example output](https://drive.google.com/file/d/1Q6KzGWGZwyeaoD9Nm3ey2bpK57BE9Dab/view?usp=drive_link)

## Task 10

```sql
CREATE TABLE PEOPLE (
	id INTEGER, 
	name TEXT
);

CREATE TABLE ADDRESS (
	id INTEGER, 
	address TEXT, 
	updatedate date
);
```

```sql
INSERT INTO PEOPLE VALUES
	(1, "A"),
	(2, "B"),
	(3, "C"),
	(4, "D");

INSERT INTO ADDRESS VALUES
	(1, "address-1-1", "2016-01-01"),
	(1, "address-1-2", "2016-09-02"),
	(2, "address-2-1", "2015-11-01"),
	(3, "address-3-1", "2016-12-01"),
	(3, "address-3-2", "2014-09-11"),
	(3, "address-3-3", "2015-01-01"),
	(4, "address-4-1", "2010-05-21"),
	(4, "address-4-2", "2012-02-11"),
	(4, "address-4-3", "2015-04-27"),
	(4, "address-4-4", "2014-01-01");
```

### Task 10.1

\-- Join table PEOPLE and ADDRESS, but keep only one address information for each person (the joined table should have the same number of rows as the table PEOPLE, it doesn't matter which address).

[View example output](https://drive.google.com/file/d/1MJO0saWt3bs4Rx0OLmP03BhqN8jGNUua/view?usp=drive_link)

### Task 10.2

\-- Join the PEOPLE and ADDRESS tables, but ONLY keep the LATEST address information for each person (the joined table should still have the same number of rows as table PEOPLE).

[View example output](https://drive.google.com/file/d/1qZkYfvzgF2EV7I26vRde-uaFiQ5m46rQ/view?usp=drive_link)

## Additional tasks (optional)

If you finish with all the tasks, here are some additional resources you can investigate to strengthen your SQL skills:

* [SQL interview questions on Data Lemur](https://datalemur.com/sql-interview-questions)
* [50 question SQL study plan on Leetcode](https://leetcode.com/studyplan/top-sql-50/)
* [SQL practice course on Interview Query](https://www.interviewquery.com/learning-paths/sql-interview)

## Feedback Form

\<iframe width="100%" title="Project-1-feedback-form" height="1000px" src="https://docs.google.com/forms/d/e/1FAIpQLSfxACEn\_EvqbI2LeEj9Tl-t\_dmWRbvfeWaESViI-r42QzHN\_A/viewform?embedded=true"/>
