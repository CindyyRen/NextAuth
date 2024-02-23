import GitHubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const options = {
  providers: [
    GoogleProvider({
      profile(profile) {
        console.log('Profile Google: ', profile);

        // let userRole = 'JOBSEEKER';
        let userRole = 'EMPLOYER';
        return {
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'email:',
          type: 'text',
          placeholder: 'your-email',
        },
        password: {
          label: 'password:',
          type: 'password',
          placeholder: 'your-password',
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials;
        try {
          const foundUser = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (foundUser) {
            console.log('User Exists');
            const match = await bcrypt.compare(
              credentials.password,
              foundUser.hashedPassword
            );

            if (match) {
              console.log('Good Pass');
              delete foundUser.hashedPassword;
              let userRole = 'EMPLOYER';
              // foundUser['role'] = 'Unverified Email';
              return foundUser;
            }
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};
