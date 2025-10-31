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

interface InvitationEmailProps {
  username?: string;
  invitedByUsername?: string;
  invitedByEmail?: string;
  teamName?: string;
  inviteLink?: string;
}

export const reactInvitationEmail = ({
  username = "there",
  invitedByUsername = "Someone",
  invitedByEmail = "",
  teamName = "the team",
  inviteLink = "#",
}: InvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {teamName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You've been invited!</Heading>
          <Text style={text}>
            Hi {username},
          </Text>
          <Text style={text}>
            <strong>{invitedByUsername}</strong> ({invitedByEmail}) has invited
            you to join <strong>{teamName}</strong>.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={inviteLink}>
              Accept Invitation
            </Link>
          </Section>
          <Text style={text}>
            If you didn't expect this invitation, you can safely ignore this email.
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

