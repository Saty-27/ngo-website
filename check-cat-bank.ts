import 'dotenv/config';
import { db } from './server/db';
import { categoryBankDetails } from './shared/schema';

async function main() {
  const result = await db.select().from(categoryBankDetails);
  console.log(result);
  process.exit(0);
}
main();
