import 'dotenv/config';
import { db } from './server/db';
import { categoryBankDetails } from './shared/schema';
import { eq } from 'drizzle-orm';

async function main() {
  await db.update(categoryBankDetails).set({qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=test@upi'}).where(eq(categoryBankDetails.id, 2));
  console.log('updated');
  process.exit(0);
}
main();
