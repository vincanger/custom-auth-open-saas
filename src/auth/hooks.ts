import { HttpError } from 'wasp/server';
import { PrismaClient } from '@prisma/client';
import type { User } from 'wasp/entities';
import type { OnAfterSignupHook, ProviderId, OAuthData } from 'wasp/server/auth';
import type { OnBeforeOAuthRedirectHook } from 'wasp/server/auth';

export const onBeforeOAuthRedirect: OnBeforeOAuthRedirectHook = async ({ url, oauth, prisma, req }) => {
  const userType = req.query.userType; // 'creator' of 'fan'
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

export const onAfterSignup: OnAfterSignupHook = async ({ providerId, user, prisma, oauth }) => {
  await validateDiscordEmail(providerId, user, prisma);
  if (oauth) {
    await updateUserTypeFromOAuth(user, oauth, prisma);
  }
};

const validateDiscordEmail = async (providerId: ProviderId, user: User, prisma: PrismaClient) => {
  if (providerId.providerName === 'discord' && !user.email) {
    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
    throw new HttpError(403, 'Discord user needs a valid email to sign up');
  }
};

const updateUserTypeFromOAuth = async (user: User, oauth: OAuthData, prisma: PrismaClient) => {
  const userTypeRecord = await prisma.userType.findFirst({
    where: {
      oauthUniqueRequestId: oauth.uniqueRequestId,
    },
  });

  if (userTypeRecord) {
    await prisma.user.update({
      where: { id: user.id },
      data: { userTypeId: userTypeRecord.id },
    });
  }
};