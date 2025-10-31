import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  username?: string;
  resetLink?: string;
}

export const reactResetPasswordEmail = ({
  username = "there",
  resetLink = "#",
}: ResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Reset Your Password</Heading>
          <Text style={text}>
            Hi {username},
          </Text>
          <Text style={text}>
            We received a request to reset your password. Click the button below to create a new password.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={resetLink}>
              Reset Password
            </Link>
          </Section>
          <Text style={text}>
            If you didn't request a password reset, you can safely ignore this email.
            This link will expire in 1 hour.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0 40px",
};

const buttonContainer = {
  margin: "32px 40px",
};

const button = {
  backgroundColor: "#3B82F6",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  width: "fit-content",
};

