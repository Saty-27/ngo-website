import 'dotenv/config';
import { db } from './server/db';
import { bankDetails } from './shared/schema';

async function main() {
  const result = await db.select().from(bankDetails);
  console.log(result);
  process.exit(0);
}
main();
