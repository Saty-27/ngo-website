# Payment Callback Issue - Debugging Guide

## Problem Summary
Payments are processing successfully on PayU's side, but:
1. Success page doesn't display after payment
2. Donations remain in "pending" status in the dashboard
3. Callback from PayU may not be reaching the server

## Payment Flow (How It Should Work)

### Step 1: Payment Initiation
- User fills donation form on `/donate` page
- Frontend sends payment details to `/api/payments/initiate`
- Server creates donation record with status: **"pending"**
- Server generates transaction ID (format: `ISKCON_xxxxxxxx`)
- Server returns PayU payment URL and form data
- User is redirected to PayU payment gateway

### Step 2: Payment on PayU
- User completes payment on PayU's secure platform
- PayU processes the payment (Cards/UPI/Net Banking)
- Payment succeeds or fails

### Step 3: PayU Callback (THIS IS WHERE THE ISSUE IS)
- PayU sends POST request to success callback URL: `https://your-domain.com/api/payments/success`
- Server receives payment response with transaction details
- Server updates donation status from "pending" to **"completed"**
- Server generates invoice number and sends PDF receipt
- Server redirects user to `/payment/success` page

### Step 4: Success Page Display
- Frontend fetches donation details from `/api/donation/{txnid}`
- Shows receipt with transaction details
- Displays thank you message

## Why Callback Might Not Work

### Issue #1: PayU Cannot Reach Your Server
**Problem**: If your server is on Replit, PayU might not be able to reach it because:
- Replit gives you a temporary URL that changes
- PayU needs a permanent, publicly accessible URL

**Solution**: Configure PayU merchant account with correct callback URLs:
```
Success URL: https://your-replit-url.replit.dev/api/payments/success
Failure URL: https://your-replit-url.replit.dev/api/payments/failure
```

### Issue #2: HTTP vs HTTPS
**Problem**: PayU requires HTTPS callbacks but server is configured for HTTP
- Line 42 in `server/routes/payment.ts` forces HTTP: `const protocol = 'http';`

**Solution**: Change to HTTPS for production:
```javascript
const protocol = 'https';  // Use HTTPS for production
```

### Issue #3: Callback URL Verification
**Problem**: PayU validates callbacks using hash verification
- If hash doesn't match, callback is rejected

**Solution**: Ensure PayU merchant salt is correctly configured (already done ✓)

## How to Debug This Issue

### Method 1: Check Server Logs
I've added detailed logging. After attempting a payment, check the logs for:

```
=== Payment Initiation Request ===
Initiating payment for: John Doe (john@example.com), Amount: ₹500
Generated transaction ID: ISKCON_abc12345
✓ Donation record created with ID: 123
Payment gateway URL: https://secure.payu.in/_payment
Success callback URL: http://your-url/api/payments/success
Failure callback URL: http://your-url/api/payments/failure
=== Payment Initiation Complete ===
```

**If callback works, you'll see:**
```
=== PayU SUCCESS Callback Received ===
Payment Response: {
  "txnid": "ISKCON_abc12345",
  "amount": "500",
  ...
}
Looking up donation with payment ID: ISKCON_abc12345
Found donation: ID=123, Status=pending
Generated invoice number: INV-20251120-001
Updating donation 123 to 'completed' status...
✓ Donation status updated successfully
Redirecting to: /payment/success?txnid=ISKCON_abc12345&amount=500&...
=== PayU SUCCESS Callback Complete ===
```

**If callback doesn't work, you WON'T see these logs** - that means PayU couldn't reach your server.

### Method 2: Manual Testing
Test the callback endpoint directly using curl:

```bash
curl -X POST https://your-url.replit.dev/api/payments/success \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "txnid=ISKCON_test123&amount=100&firstname=Test&email=test@example.com&status=success"
```

This should:
1. Show logs in your server console
2. Redirect to `/payment/success` page
3. Update donation status to "completed"

### Method 3: Check PayU Merchant Dashboard
Login to PayU merchant account and check:
1. **Webhook Configuration**: Are callback URLs set correctly?
2. **Transaction Logs**: Does PayU show successful callback delivery?
3. **Failed Callbacks**: Are there any error messages?

## Quick Fixes

### Fix 1: Update Protocol to HTTPS
Edit `server/routes/payment.ts` line 42:
```javascript
const protocol = 'https';  // Changed from 'http'
```

### Fix 2: Use Replit's Full URL
Make sure you're using Replit's full public URL format:
```
https://iskcon-juhu-donation.your-username.replit.dev
```

### Fix 3: Test with PayU Test Mode First
Before going live, test with PayU sandbox/test credentials:
- Test Merchant Key
- Test Salt
- Test callback URLs

## Expected Behavior After Fix

1. **User makes payment** → PayU processes it
2. **PayU sends callback** → Server logs appear
3. **Server updates database** → Donation status: pending → completed
4. **User sees success page** → Receipt displayed
5. **Admin sees completed donation** → Dashboard shows "completed"
6. **User receives email** → PDF receipt sent

## Current Status

✅ **Fixed Issues:**
- Payment configuration validated (LIVE mode)
- PayU credentials configured correctly
- Success/failure redirect URLs fixed
- Detailed logging added for debugging
- PDF receipt generation working

❌ **Known Issue:**
- PayU callbacks may not be reaching the server
- Need to verify callback URL accessibility
- May need HTTPS instead of HTTP for callbacks

## Next Steps

1. **Test a small payment** (₹1-10)
2. **Watch the server logs** - Look for "PayU SUCCESS Callback Received"
3. **If no logs appear** → PayU can't reach your server (callback URL issue)
4. **If logs appear but error** → Check the error message in logs
5. **Check admin dashboard** → Verify donation status changed to "completed"

## Need Help?

If the issue persists after checking these items:
1. Share the server logs from a test payment
2. Confirm your Replit URL is publicly accessible
3. Check PayU merchant dashboard for callback errors
4. Verify you're using HTTPS (not HTTP) for callbacks
