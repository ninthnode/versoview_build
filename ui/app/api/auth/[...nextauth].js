// import NextAuth from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import FacebookProvider from "next-auth/providers/facebook";
// export const authOptions = {
//   // Configure one or more authentication providers
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//     }),
//     // ...add more providers here
//   ],
// }
// export default NextAuth(authOptions)

// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  providers: [
    Providers.Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // Optional: Custom pages for sign-in, sign-out, error
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error', // Error code passed in query string as ?error=
    verifyRequest: '/auth/verify-request', // (used for check email message)
    newUser: null // If set, new users will be directed here on first sign in
  },
  // Callbacks
  callbacks: {
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session(session, token) {
      session.user.id = token.id;
      return session;
    },
  },
  // Optional: Custom theme
  theme: 'light', // or 'dark'
  // Optional: Custom events
  events: {
    signIn: async (message) => { console.log(message) },
    signOut: async (message) => { console.log(message) },
    createUser: async (message) => { console.log(message) },
    updateUser: async (message) => { console.log(message) },
    linkAccount: async (message) => { console.log(message) },
    session: async (message) => { console.log(message) },
  },
  // Optional: Custom database adapter
  adapter: null,
  // Optional: Custom secret
  secret: process.env.SECRET,
});
