# Enable Public Access for Cloudflare R2 Bucket

## Problem
Images uploaded successfully but showing "Authorization" error when accessing.

## Solution: Enable R2.dev Public Access

### Step 1: Go to Cloudflare Dashboard
1. Visit: https://dash.cloudflare.com/
2. Click on **R2** in the left sidebar
3. Click on your bucket: **baribes**

### Step 2: Enable Public Access
1. Click on the **Settings** tab
2. Scroll to **Public Access** section
3. Look for **R2.dev subdomain**
4. Click **Allow Access** button
5. You'll get a public URL like: `https://pub-xxxxxxxxxxxxx.r2.dev`
6. **Copy this URL!**

### Step 3: Update .env.local
Replace the `NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL` in your `.env.local`:

```env
NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL=https://pub-xxxxxxxxxxxxx.r2.dev
```

(Replace `xxxxxxxxxxxxx` with your actual subdomain)

### Step 4: Restart Dev Server
```bash
# Stop the server (Ctrl+C)
npm run dev
```

### Step 5: Test Upload
1. Go to Orders page
2. Create new order
3. Upload an image
4. Image should now display properly!

## Alternative: Custom Domain (Optional)

If you want to use your own domain instead of R2.dev:

1. In bucket settings, go to **Custom Domains**
2. Click **Connect Domain**
3. Enter your domain (e.g., `images.yourdomain.com`)
4. Add the CNAME record to your DNS
5. Update `.env.local` with your custom domain:
   ```env
   NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL=https://images.yourdomain.com
   ```

## Security Note

⚠️ **Public Access means anyone with the URL can view the images.**

If you need private images:
- Use signed URLs (more complex setup)
- Or keep images private and serve through your API

For a lehenga business, public access is usually fine since:
- Images are not sensitive
- You want to share them with customers
- Easier to implement

## Verify It's Working

After enabling public access, test this URL format:
```
https://pub-xxxxxxxxxxxxx.r2.dev/uploads/your-image-name.jpg
```

If it shows the image, you're good to go! ✅

## Troubleshooting

### Still getting Authorization error?
- Make sure you clicked "Allow Access" in R2 settings
- Verify the public URL is correct in `.env.local`
- Restart your dev server
- Clear browser cache

### Images not loading?
- Check browser console for errors
- Verify the full image URL in network tab
- Make sure CORS is enabled (usually automatic with R2.dev)

## Cost Impact

Public access doesn't change pricing:
- Storage: $0.015/GB/month
- Reads: $0.36 per million requests
- Egress: FREE! 🎉

Still less than $1/month for small business!
