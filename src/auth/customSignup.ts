import { HttpError } from 'wasp/server';
import {
  ensurePasswordIsPresent,
  ensureValidPassword,
  ensureValidEmail,
  createProviderId,
  sanitizeAndSerializeProviderData,
  deserializeAndSanitizeProviderData,
  findAuthIdentity,
  createUser,
  createEmailVerificationLink,
  sendEmailVerificationEmail,
} from 'wasp/server/auth';
import type { CustomSignup } from 'wasp/server/operations';

type CustomSignupInput = {
  email: string;
  password: string;
  userType: string;
};
type CustomSignupOutput = {
  success: boolean;
  message: string;
};

export const signup: CustomSignup<CustomSignupInput, CustomSignupOutput> = async (args, _context) => {
  ensureValidEmail(args);
  ensurePasswordIsPresent(args);
  ensureValidPassword(args);

  try {
    const providerId = createProviderId('email', args.email);
    const existingAuthIdentity = await findAuthIdentity(providerId);

    if (existingAuthIdentity) {
      const providerData = deserializeAndSanitizeProviderData<'email'>(existingAuthIdentity.providerData);
      // Your custom code here
      if (providerData.emailVerificationSentAt && !providerData.isEmailVerified) {
        return {
          success: false,
          message: 'User has not verified their email yet',
        };
      } else {
        return {
          success: false,
          message: 'User already exists',
        };
      }
    } else {
      // sanitizeAndSerializeProviderData will hash the user's password
      const newUserProviderData = await sanitizeAndSerializeProviderData<'email'>({
        hashedPassword: args.password,
        isEmailVerified: true, // ⚠️ TODO: change to false once email verification is implemented below.
        emailVerificationSentAt: null, // ⚠️ TODO: change to current date once email verification is implemented below.
        passwordResetSentAt: null,
      });
      const user = await createUser(
        providerId,
        newUserProviderData,
        // Any additional data you want to store on the User entity
        {
          email: args.email,
          username: args.email,
          userType: {
            create: {
              type: args.userType,
              email: args.email,
            },
          },
        }
      );

      console.log('providerId: ', providerId);
      console.log('user: ', user);
      // ⚠️ TODO: send email verification email

      // Verification link links to a client route e.g. /email-verification
      // const verificationLink = await createEmailVerificationLink(args.email, '/email-verification');
      // try {
      //   await sendEmailVerificationEmail(args.email, {
      //     from: {
      //       name: 'My App Postman',
      //       email: 'hello@itsme.com',
      //     },
      //     to: args.email,
      //     subject: 'Verify your email',
      //     text: `Click the link below to verify your email: ${verificationLink}`,
      //     html: `
      //                 <p>Click the link below to verify your email</p>
      //                 <a href="${verificationLink}">Verify email</a>
      //             `,
      //   });
      // } catch (e: unknown) {
      //   console.error('Failed to send email verification email:', e);
      //   throw new HttpError(500, 'Failed to send email verification email.');
      // }
    }
  } catch (e) {
    return {
      success: false,
      message: (e as Error).message || 'An error occurred during signup',
    };
  }

  // Your custom code after sign-up.
  // ...

  return {
    success: true,
    message: 'User created successfully',
  };
};
