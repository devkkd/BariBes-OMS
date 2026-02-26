# 🖼️ Login Page Image Setup Guide

## Current Layout

✅ **Left Side**: Full screen image area (currently gradient placeholder)
✅ **Right Side**: Logo + Login form

## How to Add Your Image

### Step 1: Add Your Image to Public Folder

Place your image in the `public` folder:

```
my-app/
  └── public/
      └── login-bg.jpg  ← Your image here
```

**Recommended Image Specs:**
- Format: JPG or PNG
- Size: 1920x1080 or higher
- Aspect Ratio: 16:9 or 9:16
- File Size: < 500KB (optimized)
- Subject: Office, workspace, abstract patterns, tech-related

### Step 2: Update Login Page

Open `src/app/login/page.jsx` and find this section (around line 47):

**Find this:**
```jsx
{/* TO ADD YOUR IMAGE: Uncomment below and add your image to public/login-bg.jpg */}
{/* 
<Image
  src="/login-bg.jpg"
  alt="Dashboard Background"
  fill
  className="object-cover"
  priority
/>
*/}
```

**Change to this:**
```jsx
{/* Your Background Image */}
<Image
  src="/login-bg.jpg"
  alt="Dashboard Background"
  fill
  className="object-cover"
  priority
/>
```

### Step 3: Remove Gradient Placeholder (Optional)

If you want only your image without gradient, find this section (around line 44):

**Remove or comment out:**
```jsx
<div className="absolute inset-0 bg-gradient-to-br from-[#975a20] via-[#7d4a1a] to-[#6b4117]">
  {/* Decorative pattern */}
  <div className="absolute inset-0 opacity-10">
    ...
  </div>
</div>
```

### Step 4: Adjust Overlay (Optional)

The dark overlay helps logo/text visibility. You can adjust it (around line 60):

**Current:**
```jsx
<div className="absolute inset-0 bg-black/20"></div>
```

**Options:**
- Lighter: `bg-black/10`
- Darker: `bg-black/40`
- No overlay: Remove this div
- Gradient overlay: `bg-gradient-to-br from-[#975a20]/60 to-[#6b4117]/60`

## Customize Logo

### Change Logo Icon

Find this section in the right side (around line 70):

**Current:**
```jsx
<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#975a20] to-[#6b4117] mb-4 shadow-lg">
  <Shield className="w-10 h-10 text-white" />
</div>
```

**Option 1: Use Your Logo Image**
```jsx
<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-gray-200 mb-4 shadow-lg overflow-hidden">
  <Image
    src="/logo.png"
    alt="Company Logo"
    width={60}
    height={60}
    className="object-contain"
  />
</div>
```

**Option 2: Different Icon**
```jsx
import { Building2 } from 'lucide-react';

<div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#975a20] to-[#6b4117] mb-4 shadow-lg">
  <Building2 className="w-10 h-10 text-white" />
</div>
```

### Change Company Name

Find this section (around line 75):

```jsx
<h2 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h2>
<p className="text-sm text-gray-500 mb-6">Admin Panel</p>
```

**Change to:**
```jsx
<h2 className="text-2xl font-bold text-gray-900 mb-1">Your Company</h2>
<p className="text-sm text-gray-500 mb-6">Your Tagline</p>
```

## Complete Example

Here's a complete example with custom image and logo:

```jsx
{/* Left Side - Full Screen Image */}
<div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
  {/* Your Background Image */}
  <Image
    src="/login-bg.jpg"
    alt="Dashboard Background"
    fill
    className="object-cover"
    priority
  />
  
  {/* Optional: Dark overlay for better contrast */}
  <div className="absolute inset-0 bg-black/30"></div>
</div>

{/* Right Side - Logo + Form */}
<div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
  <div className="w-full max-w-md">
    {/* Your Logo */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-gray-200 mb-4 shadow-lg overflow-hidden">
        <Image
          src="/logo.png"
          alt="Company Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Your Company</h2>
      <p className="text-sm text-gray-500 mb-6">Your Tagline</p>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
      <p className="text-gray-600">Sign in to access your dashboard</p>
    </div>
    {/* Rest of the form... */}
  </div>
</div>
```

## Free Image Resources

**Where to find professional images:**
- Unsplash: https://unsplash.com (Free, high-quality)
- Pexels: https://pexels.com (Free stock photos)
- Pixabay: https://pixabay.com (Free images)

**Search terms:**
- "office workspace"
- "modern office"
- "abstract technology"
- "business background"
- "minimal workspace"

## Testing

After adding your image:

```bash
npm run dev
```

Open http://localhost:3000 and check:
- ✅ Image loads properly
- ✅ Logo is visible on right side
- ✅ Form is readable
- ✅ Responsive on mobile

## Troubleshooting

**Image not showing?**
- Check file path: `/login-bg.jpg` (must be in `public/` folder)
- Check file name matches exactly
- Try refreshing browser (Ctrl+F5)

**Image too dark/bright?**
- Adjust overlay opacity: `bg-black/20` to `bg-black/40`
- Or use gradient overlay

**Logo not visible?**
- Check logo file in `public/logo.png`
- Adjust logo size: `width={60} height={60}`

---

Need help? Check the code comments in `src/app/login/page.jsx`! 🚀
