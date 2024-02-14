// Imports
import fetchPrisma from '@3xpo/fetch-prisma';
fetchPrisma();
import axios from 'axios';
import { port, domain, skipDomainCheck } from '@lib/argvHandler';
import { app } from '@lib/createServer';
import { env } from '@lib/env';

// Exceptions
import { DomainCheckNotValid } from '@lib/exceptions';

// Initialisation
app.listen(port, async () => {
  console.log(
    `Server is listening on ${
      env === 'prod'
        ? `https://${domain}/api (internal port: ${port})`
        : `http://localhost:${port}`
    }`
  );

  // Check if domain is valid
  if (env === 'prod' && domain && !skipDomainCheck) {
    try {
      const response = await axios.get(`https://${domain}/api`);
      if (response.status !== 200) throw null
    } catch (e) {
      throw new DomainCheckNotValid(domain);
    }
  } else if (env === 'dev') {
    try {
      const response = await axios.get(`http://localhost:${port}`);
      if (response.status !== 200) throw null
    } catch (e) {
      throw new DomainCheckNotValid('localhost');
    }
  }
  console.log('Domain check passed');
});