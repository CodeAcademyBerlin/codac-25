# Black Owls Seed Script

This script seeds the database with the Black Owls cohort data, including students, courses, enrollments, and progress tracking.

## What it creates

### 🏫 Cohort
- **Black Owls**: Elite cohort graduating July 2025 (started January 27, 2025)

### 👥 Students (8 students)
- **Max & Fernando**: Web Development track students
- **Julien, Marc, Katharina, Gökce, Tiba, Aleksandra**: Data Science track students

### 📖 Courses (6 courses)
- **Web Development**: Frontend Development, Full-Stack Development
- **Data Science**: Data Analysis Fundamentals, Data Visualization & ML, Data Engineering  
- **Career Development**: Career Development course (all students enrolled)

### 📊 Progress
- All students have high progress (80-99%) indicating they're near graduation
- Realistic lesson progress and completion status
- Course enrollments with proper timestamps

## Usage

```bash
# Run the seed script
npx tsx scripts/seed-black-owls.ts

# Or using npm
npm run seed-black-owls
```

## Login Information

### Students
- **Email**: `[firstname]@codac.academy` (e.g., `max@codac.academy`)
- **Password**: `password123`

### Admin
- **Email**: `admin@codac.academy`
- **Password**: `password123`

## Course Enrollments

### Web Development Students (Started Jan 27, 2025)
- **Max**: Frontend Development (95%, Jan 27), Full-Stack Development (92%, Mar 15), Career Development (88%, May 15)
- **Fernando**: Frontend Development (91%, Jan 27), Full-Stack Development (96%, Mar 15), Career Development (90%, May 15)

### Data Science Students (Started Jan 27, 2025)
- **Julien**: Data Analysis (98%, Jan 27), Data Visualization & ML (94%, Mar 10), Data Engineering (85%, Apr 28), Career Development (92%, Jun 2)
- **Marc**: Data Analysis (95%, Jan 27), Data Visualization & ML (89%, Mar 10), Data Engineering (82%, Apr 28), Career Development (87%, Jun 2)
- **Katharina**: Data Analysis (97%, Jan 27), Data Visualization & ML (93%, Mar 10), Data Engineering (88%, Apr 28), Career Development (95%, Jun 2)
- **Gökce**: Data Analysis (93%, Jan 27), Data Visualization & ML (91%, Mar 10), Data Engineering (86%, Apr 28), Career Development (89%, Jun 2)
- **Tiba**: Data Analysis (90%, Jan 27), Data Visualization & ML (87%, Mar 10), Data Engineering (83%, Apr 28), Career Development (91%, Jun 2)
- **Aleksandra**: Data Analysis (99%, Jan 27), Data Visualization & ML (96%, Mar 10), Data Engineering (92%, Apr 28), Career Development (94%, Jun 2)

## Features

- ✅ Realistic course progress for graduation simulation
- ✅ Proper lesson completion tracking
- ✅ Multiple learning tracks (Web Dev vs Data Science)
- ✅ Career development for all students
- ✅ Clean database state (removes existing data)
- ✅ Comprehensive logging and progress reporting

## Perfect for

- Graduation day demonstrations
- Testing graduation workflows
- Showcasing student progress
- Testing LMS functionality
- Demo presentations

## Files Used

- `prisma/seed/black-owls-demo.json` - Student and cohort data
- `prisma/seed/courses.json` - Course definitions
- `scripts/seed-black-owls.ts` - Main seed script

## Notes

- All students are in "ACTIVE" status (not yet graduated)
- **Timeline**: Started January 27, 2025 - Graduating July 4, 2025 (today!)
- High progress percentages indicate students are ready for graduation
- Each course has 3 sample lessons with realistic content
- Progress tracking includes lesson completion timestamps
- Realistic 5.5-month bootcamp timeline with progressive course enrollment 