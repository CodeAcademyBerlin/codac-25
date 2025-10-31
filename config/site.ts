export const siteConfig = {
  name: "CODAC",
  description: "CODAC Learning Management System",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  email: {
    from: process.env.EMAIL_FROM || "noreply@codac.com",
    testEmail: process.env.EMAIL_TEST_TO,
  },
  auth: {
    appName: process.env.AUTH_APP_NAME || "CODAC",
  },
};

