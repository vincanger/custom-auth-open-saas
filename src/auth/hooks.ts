import { HttpError } from 'wasp/server';
import type { OnAfterSignupHook, OnBeforeSignupHook } from 'wasp/server/auth';
import type { OnBeforeOAuthRedirectHook } from 'wasp/server/auth';

export const onAfterSignup: OnAfterSignupHook = async ({ providerId, user, prisma, oauth }) => {
  // For Stripe to function correctly, we need a valid email associated with the user.
  // Discord allows an email address to be optional. If this is the case, we delete the user
  // from our DB and throw an error.
  if (providerId.providerName === 'discord' && !user.email) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    throw new HttpError(403, 'Discord user needs a valid email to sign up');
  }

  let userTypeRecord;
  if (oauth) {
    userTypeRecord = await prisma.userType.findFirst({
      where: {
        oauthUniqueRequestId: oauth.uniqueRequestId,
      },
    });
  }

  if (userTypeRecord) {
    await prisma.user.update({
      where: { id: user.id },
      data: { userTypeId: userTypeRecord.id },
    });
  }
};

export const onBeforeOAuthRedirect: OnBeforeOAuthRedirectHook = async ({ url, oauth, prisma, req }) => {
  const userType = req.query.userType;
  let userTypeRecord;
  if (userType && typeof userType === 'string') {
    userTypeRecord = await prisma.userType.create({
      data: {
        type: userType,
        oauthUniqueRequestId: oauth?.uniqueRequestId,
      },
    });
  }
  console.log(userTypeRecord);

  return { url };
};

// export const onBeforeSignup: OnBeforeSignupHook = async ({ req, prisma }) => {
//   const userType = req.query.userType;
//   console.log(req.body)
//   console.log(req)
//   if (userType && typeof userType === 'string') {
//     await prisma.userType.create({
//       data: {
//         type: userType,
//         email: req.body.email,
//       },
//     });
//   }
// };