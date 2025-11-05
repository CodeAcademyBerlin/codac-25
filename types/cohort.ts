export type User = {
  name: string;
  username: string;
  email: string;
  role: string;
  bio: string;
  image: string;
  githubUrl: string;
  start_date: string | null;
  end_date: string | null;
  course: string;
  cohort: string;
};

export type Cohort = {
  name: string;
  slug: string;
  image: string | null;
  startDate: Date;
  endDate: Date | null;
};

