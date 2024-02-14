import prisma from '../src/lib/prisma';

const reset = async () => {
  // await prisma.keyPair.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.token.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.userChannelPermissions.deleteMany();
  await prisma.message.deleteMany();
  await prisma.messageText.deleteMany();
};

reset();
