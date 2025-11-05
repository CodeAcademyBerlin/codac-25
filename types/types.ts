import type { auth } from "@/lib/auth";
import { client } from "@/lib/auth-client";

export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof client.$Infer.ActiveOrganization;
export type Invitation = typeof client.$Infer.Invitation;
