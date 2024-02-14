import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

process.on('exit', async codeErr => {
  console.log(`Process exiting: ${codeErr}`);
  await prisma.$disconnect();
});
