# CODAC Seed Data System

A comprehensive and modular seeding system for the CODAC platform with independent seeders for different data types.

## 📂 Structure

```
prisma/seed/
├── data/                           # JSON data files
│   ├── attack-on-titan-cohorts.json  # Attack on Titan themed cohorts
│   ├── attack-on-titan-users.json    # Attack on Titan themed users
│   ├── black-owls-cohort.json        # Black Owls cohort data
│   ├── black-owls-users.json         # Black Owls users with enrollments
│   ├── courses.json                   # Course definitions
│   ├── jobs.json                      # Job postings
│   └── quizzes.json                   # Quiz questions and answers
├── seeders/                        # Independent seeding modules
│   ├── attack-on-titan.ts             # Attack on Titan seeder
│   ├── black-owls.ts                  # Black Owls seeder
│   ├── lms-content.ts                 # LMS content importer
│   ├── quizzes.ts                     # Quiz seeder
│   └── jobs.ts                        # Job seeder
├── seed.ts                         # Main unified seed script
└── README.md                       # This documentation
```

## 🚀 Quick Start

### Interactive Mode

```bash
# Start interactive seeding menu
pnpm db:seed
```

### Command Line Usage

```bash
# Seed all data
pnpm db:seed:all

# Clean all data
pnpm db:seed:clean

# Seed specific data types
pnpm db:seed:attack-on-titan
pnpm db:seed:black-owls
pnpm db:seed:lms
pnpm db:seed:quizzes
pnpm db:seed:jobs

# Reset database completely
pnpm db:reset
```

## 📋 Available Seeders

### 1. Attack on Titan Theme (`attack-on-titan`)

- **Description**: Users and cohorts with Attack on Titan anime theme
- **Data**: 16 users including students, mentors, admins, and alumni
- **Cohorts**: 5 military divisions (Scouts, Garrison, Military Police, etc.)
- **Features**:
  - Themed user profiles with character backgrounds
  - Military division cohorts
  - Admin and alumni users
  - Default password: `password123`

### 2. Black Owls Cohort (`black-owls`)

- **Description**: Black Owls cohort with detailed progress tracking
- **Data**: 8 students with course enrollments and progress
- **Features**:
  - Real course enrollments with progress percentages
  - Lesson progress tracking
  - Web development and data science tracks
  - Realistic student portfolios

### 3. LMS Content (`lms-content`)

- **Description**: Import LMS content from markdown files
- **Source**: `/content` directory (if exists)
- **Features**:
  - Automatic course/project/lesson creation
  - Markdown to PlateJS conversion
  - Frontmatter support
  - Asset handling (placeholder)

### 4. Quiz Data (`quizzes`)

- **Description**: Comprehensive quiz questions and answers
- **Data**: 500+ questions across multiple topics and difficulties
- **Topics**: JavaScript, HTML, CSS, React, TypeScript, etc.
- **Difficulties**: Beginner, Medium, Advanced
- **Features**:
  - Full quiz replacement or incremental addition
  - Multiple choice questions with explanations

### 5. Job Postings (`jobs`)

- **Description**: Sample job postings for career board
- **Data**: 6 diverse job postings
- **Features**:
  - Various job types (Frontend, Backend, Data Science, etc.)
  - Salary ranges and requirements
  - Remote and on-site positions

## 🛠️ Technical Details

### Independent Seeders

Each seeder module exports:

- `seed*()` - Main seeding function
- `clean*()` - Cleanup function
- Proper error handling with typed errors
- Comprehensive logging

### Data Organization

- **JSON Files**: Structured data in `/data` folder
- **Validation**: TypeScript interfaces for data validation
- **Consistency**: Standardized data formats across seeders
- **Maintenance**: Easy to update and maintain

### Error Handling

- Graceful error handling with detailed logging
- Rollback capabilities for failed operations
- Comprehensive error messages
- TypeScript error type safety

## 📊 Usage Examples

### Interactive Menu

```bash
$ pnpm db:seed

🌱 CODAC Seed Data Manager
═══════════════════════════════════════

Available seeding options:
1. Attack on Titan Theme
   Users and cohorts with Attack on Titan theme
2. Black Owls Cohort
   Black Owls cohort with users and course progressions
3. LMS Content
   Import LMS content from markdown files
4. Quiz Data
   Import quiz questions and answers
5. Quiz Data (Incremental)
   Import quiz questions incrementally (preserves existing)
6. Job Postings
   Import job postings data

Special commands:
a. Seed ALL data
c. Clean ALL data
x. Exit

Enter your choice (number, letter, or comma-separated numbers):
>
```

### Command Line Examples

```bash
# Seed multiple specific datasets
tsx prisma/seed/seed.ts 1,4,6

# Seed everything
tsx prisma/seed/seed.ts all

# Clean everything
tsx prisma/seed/seed.ts clean

# Seed only Attack on Titan
tsx prisma/seed/seed.ts 1
```

## 🔧 Development

### Adding New Seeders

1. Create data file in `/data` folder
2. Create seeder module in `/seeders` folder
3. Add to `seedOptions` in `seed.ts`
4. Add npm script to `package.json`

### Data File Format

```json
{
  "name": "Example Data",
  "description": "Description of the data",
  "items": [
    {
      "field1": "value1",
      "field2": "value2"
    }
  ]
}
```

### Seeder Module Template

```typescript
import { PrismaClient } from "@prisma/client";
import { logger } from "../../../lib/logger";

const prisma = new PrismaClient();

export async function seedExample() {
  try {
    logger.info("🌱 Starting example seed...");

    // Load data
    const data = JSON.parse(/* ... */);

    // Clean existing data
    await prisma.example.deleteMany();

    // Create new data
    await prisma.example.createMany({ data });

    logger.info("✅ Example seed completed successfully!");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error : new Error(String(error));
    logger.error("❌ Example seed failed:", errorMessage);
    throw errorMessage;
  }
}

export async function cleanExample() {
  try {
    logger.info("🧹 Cleaning example data...");
    await prisma.example.deleteMany();
    logger.info("✅ Example data cleaned successfully!");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error : new Error(String(error));
    logger.error("❌ Failed to clean example data:", errorMessage);
    throw errorMessage;
  }
}
```

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "db:seed": "tsx prisma/seed/seed.ts",
    "db:seed:all": "tsx prisma/seed/seed.ts all",
    "db:seed:clean": "tsx prisma/seed/seed.ts clean",
    "db:seed:attack-on-titan": "tsx prisma/seed/seed.ts 1",
    "db:seed:black-owls": "tsx prisma/seed/seed.ts 2",
    "db:seed:lms": "tsx prisma/seed/seed.ts 3",
    "db:seed:quizzes": "tsx prisma/seed/seed.ts 4",
    "db:seed:jobs": "tsx prisma/seed/seed.ts 6",
    "db:reset": "prisma db push --force-reset && pnpm db:seed:all"
  }
}
```

## 🎯 Best Practices

1. **Always backup** before running `db:reset`
2. **Test individual seeders** before running `all`
3. **Use incremental mode** for quizzes to preserve existing data
4. **Check logs** for detailed error information
5. **Run `db:seed:clean`** before switching between themes

## 🔐 Default Login Credentials

After seeding, you can login with:

- **Email**: `admin@codac.academy`
- **Password**: `password123`

Or any user from the Attack on Titan theme:

- **Email**: `eren.yeager@codac.academy`
- **Password**: `password123`

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**

   - Ensure database is running
   - Check connection string in `.env`

2. **TypeScript compilation errors**

   - Run `pnpm db:generate` first
   - Check for missing dependencies

3. **Data validation errors**

   - Verify JSON data format
   - Check required fields in schemas

4. **Memory issues with large datasets**
   - Use incremental seeding for large data
   - Consider batch processing

### Getting Help

1. Check logs for detailed error messages
2. Use `tsx prisma/seed/seed.ts --help` for usage info
3. Review data files for format issues
4. Ensure all dependencies are installed

## 📈 Performance

- **Optimized batch inserts** for large datasets
- **Parallel processing** where possible
- **Incremental updates** for existing data
- **Memory-efficient** data processing
- **Progress tracking** for long operations

## 🔄 Migration Notes

This new system replaces the old scattered seeding scripts:

- ✅ `scripts/seed-demo-data.ts` → `seeders/black-owls.ts`
- ✅ `scripts/seed-black-owls.ts` → `seeders/black-owls.ts`
- ✅ `scripts/seed-users-cohors-attack-on-titan.ts` → `seeders/attack-on-titan.ts`
- ✅ `scripts/import-lms-content.ts` → `seeders/lms-content.ts`
- ✅ `scripts/upload-all-quizzes.ts` → `seeders/quizzes.ts`

All old scripts and data files have been removed and replaced with the new modular system.
