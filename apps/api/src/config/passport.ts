import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { prisma } from './database';
import logger from '../utils/logger';
import { sendMail } from '../utils/emailSender';
import { getWelcomeEmailHtml } from '../utils/emailTemplates';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'your-64-char-access-secret';

// JWT Strategy for token verification
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_ACCESS_SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: jwtPayload.id },
          select: { id: true, email: true, role: true, isActive: true },
        });

        if (user) {
          if (!user.isActive) {
            return done(null, false, { message: 'User account is deactivated.' });
          }
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google OAuth Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/v1/auth/google/callback';

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email linked with this Google profile.'), undefined);
          }

          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { googleId: profile.id },
                { email: email }
              ]
            }
          });

          if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { googleId: profile.id, avatar: user.avatar || profile.photos?.[0]?.value },
              });
            }
            return done(null, user);
          }

          // Register new user via Google
          const newUser = await prisma.user.create({
            data: {
              name: profile.displayName,
              email: email,
              googleId: profile.id,
              avatar: profile.photos?.[0]?.value,
              emailVerified: true,
              role: 'CUSTOMER',
            },
          });

          // Send welcome email in the background
          const welcomeHtml = getWelcomeEmailHtml(newUser.name);
          sendMail({
            to: newUser.email,
            subject: 'Welcome to CrochetCraft Pro!',
            html: welcomeHtml,
          }).catch((err) => {
            logger.error(`Failed to send welcome email to ${newUser.email}:`, err);
          });

          return done(null, newUser);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
} else {
  logger.warn('Google Client Credentials missing. Google OAuth disabled.');
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
