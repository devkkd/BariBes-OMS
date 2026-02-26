# Cloudflare R2 Setup Guide

## Step 1: Create Cloudflare R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **R2 Object Storage** from the left sidebar
3. Click **Create bucket**
4. Enter a bucket name (e.g., `lehenga-orders-images`)
5. Click **Create bucket**

## Step 2: Get API Credentials

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Give it a name (e.g., `lehenga-app-upload`)
4. Set permissions:
   - **Object Read & Write** for your bucket
5. Click **Create API Token**
6. **IMPORTANT:** Copy and save these credentials (you won't see them again):
   - Access Key ID
   - Secret Access Key
   - Account ID (shown in the R2 dashboard URL)

## Step 3: Configure Public Access (Optional)

If you want images to be publicly accessible:

1. Go to your bucket settings
2. Click **Settings** tab
3. Under **Public Access**, click **Allow Access**
4. Configure custom domain or use R2.dev subdomain

## Step 4: Update .env.local

Add these variables to your `.env.local` file:

```env
# Cloudflare R2 Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_ACCESS_KEY_ID=your_access_key_id_here
CLOUDFLARE_SECRET_ACCESS_KEY=your_secret_access_key_here
CLOUDFLARE_BUCKET_NAME=lehenga-orders-images
NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL=https://your-bucket.your-account.r2.cloudflarestorage.com
```

### How to find these values:

- **CLOUDFLARE_ACCOUNT_ID**: Found in your Cloudflare dashboard URL or R2 overview page
- **CLOUDFLARE_ACCESS_KEY_ID**: From Step 2 (API token creation)
- **CLOUDFLARE_SECRET_ACCESS_KEY**: From Step 2 (API token creation)
- **CLOUDFLARE_BUCKET_NAME**: The name you gave your bucket in Step 1
- **NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL**: 
  - If using custom domain: `https://your-custom-domain.com`
  - If using R2.dev: `https://pub-xxxxx.r2.dev` (enable in bucket settings)

## Step 5: Install Dependencies

```bash
npm install
```

This will install `@aws-sdk/client-s3` which is required for R2 (S3-compatible).

## Step 6: Test Upload

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login to your dashboard
3. Go to Orders page
4. Click "New Order"
5. Try uploading an image in the Billing Photo section

## Features

✅ Single image upload (Billing Photo)
✅ Multiple image upload (Lehenga Photos - max 5)
✅ Image preview before upload
✅ File type validation (JPG, PNG, WebP only)
✅ File size validation (5MB max per file)
✅ Drag & drop support
✅ Remove uploaded images
✅ Progress indicator

## Troubleshooting

### Error: "Failed to upload files"
- Check if your API credentials are correct in `.env.local`
- Verify bucket name is correct
- Ensure API token has read & write permissions

### Images not displaying
- Check if public access is enabled on your bucket
- Verify `NEXT_PUBLIC_CLOUDFLARE_PUBLIC_URL` is correct
- Try accessing the image URL directly in browser

### CORS errors
- Go to bucket settings
- Add CORS policy:
  ```json
  [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"]
    }
  ]
  ```

## Cost

Cloudflare R2 pricing (as of 2024):
- **Storage**: $0.015/GB per month
- **Class A operations** (writes): $4.50 per million requests
- **Class B operations** (reads): $0.36 per million requests
- **Egress**: FREE (no bandwidth charges!)

For a small lehenga business with ~100 orders/month:
- Estimated cost: **Less than $1/month** 🎉

## Security Best Practices

1. ✅ Never commit `.env.local` to git
2. ✅ Use separate API tokens for development and production
3. ✅ Restrict API token permissions to specific buckets only
4. ✅ Enable public access only if needed
5. ✅ Consider adding image optimization/resizing
6. ✅ Implement rate limiting on upload endpoint

## Next Steps

- [ ] Add image compression before upload
- [ ] Implement image resizing (thumbnails)
- [ ] Add watermark to images
- [ ] Create image gallery view in orders
- [ ] Add bulk delete functionality
