import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const DEMO_INSTITUTION = {
  slug: "bd-gps",
  name: "BD-GPS Govt Primary Demo School",
  email: "admin@school.edu",
  city: "Dhaka",
  country: "BD",
  timezone: "Asia/Dhaka",
  currency: "BDT",
};

const DEMO_USERS = [
  { email: "admin@school.edu", password: "admin123", name: "Admin", role: "ADMIN" },
  { email: "principal@school.edu", password: "principal123", name: "Dr. Sarah Chen", role: "PRINCIPAL" },
  { email: "teacher.demo@school.edu", password: "teacher123", name: "Demo Teacher", role: "TEACHER" },
  { email: "student.demo@school.edu", password: "student123", name: "Demo Student", role: "STUDENT" },
  { email: "parent.demo@school.edu", password: "parent123", name: "Demo Parent", role: "PARENT" },
] as const;

async function ensureDemoUser(email: string, password: string, name: string, role: string) {
  const institution = await db.institution.upsert({
    where: { slug: DEMO_INSTITUTION.slug },
    update: { isActive: true },
    create: {
      name: DEMO_INSTITUTION.name,
      slug: DEMO_INSTITUTION.slug,
      email: DEMO_INSTITUTION.email,
      city: DEMO_INSTITUTION.city,
      country: DEMO_INSTITUTION.country,
      timezone: DEMO_INSTITUTION.timezone,
      currency: DEMO_INSTITUTION.currency,
      isActive: true,
    },
  });

  const hashedPassword = await bcrypt.hash(password, 12);
  
  const user = await db.user.upsert({
    where: { email },
    update: { password: hashedPassword, role, isActive: true, approvalStatus: "APPROVED", institutionId: institution.id },
    create: {
      email,
      name,
      password: hashedPassword,
      role,
      isActive: true,
      approvalStatus: "APPROVED",
      emailVerified: new Date(),
      institutionId: institution.id,
    },
  });

  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/login/admin" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        institution: { label: "Institution", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const institution = (credentials?.institution as string)?.trim().toLowerCase() || "";
        const email = (credentials?.email as string)?.trim().toLowerCase();
        const password = credentials?.password as string;

        if (!institution || !email || !password) {
          return null;
        }

        // Find user in database
        const user = await db.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
            isActive: true,
            approvalStatus: "APPROVED",
            institution: { slug: { equals: institution, mode: "insensitive" } },
          },
          include: { institution: { select: { name: true, slug: true } } },
        });

        if (!user?.password) {
          // Demo auto-provision: only for bd-gps institution
          if (institution !== DEMO_INSTITUTION.slug) return null;
          
          const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email);
          if (!demoUser || demoUser.password !== password) return null;
          
          const created = await ensureDemoUser(demoUser.email, demoUser.password, demoUser.name, demoUser.role);
          return {
            id: created.id,
            email: created.email,
            name: created.name,
            role: created.role,
            institutionId: created.institutionId,
            institutionName: DEMO_INSTITUTION.name,
            institutionSlug: DEMO_INSTITUTION.slug,
          };
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          institutionId: user.institutionId,
          institutionName: user.institution.name,
          institutionSlug: user.institution.slug,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).role = (user as any).role;
        (token as any).institutionId = (user as any).institutionId;
        (token as any).institutionName = (user as any).institutionName;
        (token as any).institutionSlug = (user as any).institutionSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
        (session.user as any).institutionId = (token as any).institutionId;
        (session.user as any).institutionName = (token as any).institutionName;
        (session.user as any).institutionSlug = (token as any).institutionSlug;
      }
      return session;
    },
  },
});
