# Community Feature

The Community feature provides a comprehensive landing page to showcase all cohorts and students in the CODAC platform. This feature enhances the social aspect of the learning management system by allowing users to explore different cohorts and connect with fellow students.

## Features

### 🏠 Community Landing Page (`/community`)

- **Overview Statistics**: Display total students, active students, graduates, and active cohorts
- **Cohorts Grid**: Interactive cards showing all available cohorts with:
  - Cohort name and description
  - Start date and status (Active/Upcoming)
  - Student count and avatar previews
  - Links to individual cohort pages
- **Featured Students**: Showcase the most active community members based on their activity scores
- **Responsive Design**: Fully responsive layout optimized for all device sizes
- **Loading States**: Beautiful skeleton screens during data fetching

### 👥 Individual Cohort Pages (`/community/cohorts/[slug]`)

- **Cohort Header**: Large avatar, name, description, and status
- **Cohort Statistics**: Total students, active students, and graduates
- **Student Directory**: Complete list of all students in the cohort
- **Breadcrumb Navigation**: Easy navigation back to the community page
- **SEO Optimized**: Dynamic metadata generation for better search visibility
- **Static Generation**: Pre-built pages for better performance

## File Structure

```
app/community/
├── page.tsx                    # Main community landing page
├── layout.tsx                  # Community section layout
├── loading.tsx                 # Loading UI with skeletons
└── cohorts/
    └── [slug]/
        └── page.tsx            # Individual cohort pages

actions/user/
└── get-cohorts.ts              # Server action to fetch cohorts and students

components/community/
├── cohort-card.tsx             # Cohort display card component
└── student-card.tsx            # Student display card component
```

## Data Structure

### Cohort Model

```typescript
type CohortWithStudents = {
  id: string;
  name: string;
  slug: string;
  startDate: Date;
  description?: string;
  avatar?: string;
  students: Student[];
  _count: {
    students: number;
  };
};
```

### Student Data

Each student includes:

- Basic profile information (name, email, avatar, bio)
- Status and role badges
- Social links (GitHub, LinkedIn, Portfolio)
- Activity statistics (documents, posts, courses, achievements)
- Current job and company information
- Graduation date (if applicable)

## Key Components

### CohortCard

Interactive card component that displays:

- Cohort avatar and name
- Status badge (Active/Upcoming)
- Student count and start date
- Description preview
- Student avatar previews (first 5 students)
- Hover effects and animations

### StudentCard

Comprehensive student profile card showing:

- Student avatar and name
- Role and status badges
- Bio and current job information
- Activity statistics grid
- Social media links
- Cohort affiliation

## Server Actions

### getCohorts()

Fetches all cohorts with their associated students and statistics:

- Returns type-safe data with proper error handling
- Includes student counts and activity metrics
- Optimized database queries with selective field loading
- Comprehensive logging for monitoring and debugging

## Styling & UI

- **Design System**: Built with Shadcn UI and Radix UI components
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Animations**: Smooth hover effects and card interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Dark Mode**: Full support for light/dark theme switching

## Navigation Integration

The community feature is integrated into the main navigation sidebar:

- Primary navigation item: "Community"
- Sub-navigation items:
  - Discussions (planned)
  - Showcase (planned)
  - Events (planned)
  - Study Groups (planned)

## Performance Optimizations

1. **Server Components**: Leverages React Server Components for better performance
2. **Static Generation**: Individual cohort pages are statically generated
3. **Optimized Queries**: Database queries only fetch necessary fields
4. **Image Optimization**: Proper avatar handling with fallbacks
5. **Loading States**: Skeleton UI prevents layout shifts

## Future Enhancements

- **Search & Filtering**: Add search functionality for students and cohorts
- **Student Profiles**: Individual student profile pages
- **Mentorship Integration**: Connect mentors with students
- **Activity Feed**: Real-time community activity updates
- **Messaging System**: Direct messaging between community members
- **Events Calendar**: Community events and meetups
- **Achievement Showcase**: Highlight student accomplishments

## Usage Examples

### Accessing the Community

```
Visit: https://your-app.com/community
```

### Viewing a Specific Cohort

```
Visit: https://your-app.com/community/cohorts/104th-training-corps
```

### API Usage (Internal)

```typescript
import { getCohorts } from "@/actions/user/get-cohorts";

const result = await getCohorts();
if (result.success) {
  const { cohorts, totalStudents } = result.data;
  // Use the data...
}
```

## Contributing

When adding new features to the community section:

1. Follow the established component patterns
2. Use TypeScript for all new code
3. Add proper error handling and loading states
4. Include responsive design considerations
5. Update this documentation

## Testing

The community feature should be tested with:

- Different cohort sizes (empty, small, large)
- Various student activity levels
- Different device sizes and browsers
- Light and dark themes
- Slow network conditions (loading states)
