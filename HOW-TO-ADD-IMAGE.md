# 🖼️ How to Add Your Login Background Image

## Quick Steps

### 1. Add Your Image

Place your image in the `public` folder:
```
my-app/
  └── public/
      └── login-bg.jpg  (your image here)
```

### 2. Update Login Page

Open `src/app/login/page.js` and find this section (around line 40):

**REPLACE THIS:**
```jsx
{/* Background Image - Replace with your image */}
<div className="absolute inset-0">
  {/* Placeholder gradient - Replace this div with your Image component */}
  <div className="w-full h-full bg-gradient-to-br from-[#975a20] via-[#7d4a1a] to-[#6b4117]">
    {/* Decorative pattern */}
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-3xl"></div>
    </div>
  </div>
  
  {/* Uncomment below to use actual image */}
  {/* <Image
    src="/login-bg.jpg"
    alt="Dashboard Background"
    fill
    className="object-cover"
    priority
  /> */}
</div>
```

**WITH THIS:**
```jsx
{/* Background Image */}
<div className="absolute inset-0">
  <Image
    src="/login-bg.jpg"
    alt="Dashboard Background"
    fill
    className="object-cover"
    priority
  />
</div>
```

### 3. Done! 🎉

Your image will now show on the left side with the logo on top!

## Customization Options

### Option 1: Image with Dark Overlay (Better Logo Visibility)
```jsx
<div className="absolute inset-0">
  <Image
    src="/login-bg.jpg"
    alt="Dashboard Background"
    fill
    className="object-cover"
    priority
  />
</div>
{/* Dark overlay - already in code */}
<div className="absolute inset-0 bg-black/20"></div>
```

### Option 2: Image with Gradient Overlay
```jsx
<div className="absolute inset-0">
  <Image
    src="/login-bg.jpg"
    alt="Dashboard Background"
    fill
    className="object-cover"
    priority
  />
</div>
{/* Replace dark overlay with gradient */}
<div className="absolute inset-0 bg-gradient-to-br from-[#975a20]/60 to-[#6b4117]/60"></div>
```

### Option 3: Just Image (No Overlay)
```jsx
<div className="absolute inset-0">
  <Image
    src="/login-bg.jpg"
    alt="Dashboard Background"
    fill
    className="object-cover"
    priority
  />
</div>
{/* Remove the overlay div */}
```

## Customize Logo

Find the logo section (around line 60) and update:

```jsx
<div className="absolute top-8 left-8 z-10">
  <div className="flex items-center gap-3">
    {/* Logo Icon */}
    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg">
      <Shield className="w-7 h-7 text-white" />
    </div>
    {/* Logo Text - CHANGE THIS */}
    <div className="text-white">
      <h2 className="text-2xl font-bold">Your Company</h2>
      <p className="text-xs text-white/80">Your Tagline</p>
    </div>
  </div>
</div>
```

### Use Your Own Logo Image

Replace the Shield icon with your logo:

```jsx
<div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-lg overflow-hidden">
  <Image
    src="/logo.png"
    alt="Logo"
    width={32}
    height={32}
    className="object-contain"
  />
</div>
```

## Recommended Image Specs

**Background Image:**
- Format: JPG or PNG
- Size: 1920x1080 or higher
- Aspect Ratio: 16:9
- File Size: < 500KB (optimized)
- Subject: Office, workspace, abstract, tech-related

**Logo:**
- Format: PNG (with transparency)
- Size: 512x512 or similar
- File Size: < 100KB

## Current Setup

Right now:
- ✅ Logo is in top-left corner
- ✅ Gradient background (placeholder)
- ✅ Ready to add your image
- ✅ Form on right side

Just add your image to `public/` folder and uncomment the Image component! 🚀
