# 🎨 UI Design Guide

## Design System Overview

### Color Palette

**Primary Gradient:**
- Main: `#975a20` (Bronze/Copper)
- Dark: `#7d4a1a` (Dark Bronze)
- Darker: `#6b4117` (Deep Bronze)

**Gradient Classes:**
```css
from-[#975a20] to-[#7d4a1a]
from-[#7d4a1a] to-[#6b4117]
```

**Background:**
- White: `#ffffff`
- Light Gray: `#f9fafb` (gray-50)
- Medium Gray: `#f3f4f6` (gray-100)

**Accent Colors:**
- Success: Green (green-500 to green-600)
- Error: Red (red-500 to red-600)
- Info: Blue (blue-500 to blue-600)
- Warning: Purple (purple-500 to purple-600)

### Typography

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

**Text Sizes:**
- Heading 1: `text-3xl` (30px)
- Heading 2: `text-2xl` (24px)
- Heading 3: `text-lg` (18px)
- Body: `text-sm` (14px)
- Small: `text-xs` (12px)

### Spacing

**Padding:**
- Small: `p-4` (16px)
- Medium: `p-6` (24px)
- Large: `p-8` (32px)

**Gaps:**
- Small: `gap-2` (8px)
- Medium: `gap-4` (16px)
- Large: `gap-6` (24px)

### Border Radius

- Small: `rounded-lg` (8px)
- Medium: `rounded-xl` (12px)
- Large: `rounded-2xl` (16px)
- Full: `rounded-full`

## Component Styles

### 1. Login Page

**Layout:**
- Split screen design (50/50 on desktop)
- Left: White background with form
- Right: Gradient background with features

**Form Elements:**
- Input fields with icons (Lucide React)
- Rounded corners: `rounded-xl`
- Focus ring: `focus:ring-2 focus:ring-[#975a20]`
- Password toggle with eye icon

**Gradient Side:**
- Background: `bg-gradient-to-br from-[#975a20] via-[#7d4a1a] to-[#6b4117]`
- Decorative blur circles
- Feature cards with icons

### 2. Header

**Structure:**
- Sticky top navigation
- White background with bottom border
- Welcome message with date
- Right side: Role badge, notifications, logout

**Elements:**
- Role badge with gradient background
- Notification bell with red dot indicator
- Logout button with gradient and shadow
- Calendar icon for date display

### 3. Sidebar

**Design:**
- Width: `w-72` (288px)
- White background
- Logo section at top
- Navigation menu in middle
- User profile at bottom

**Navigation Items:**
- Active state: Gradient background with shadow
- Hover state: Light gray background
- Icons from Lucide React
- Chevron indicator for active item

**User Profile Card:**
- Gradient avatar circle
- Name and email display
- Rounded card with border

### 4. Dashboard Cards

**Stats Cards:**
- White background
- Rounded corners: `rounded-2xl`
- Icon in colored background circle
- Trend indicator (up/down)
- Shadow on hover

**Activity Cards:**
- White background with border
- Hover effect on items
- Status indicators (green/red)
- Time stamps with clock icon

**Quick Action Buttons:**
- Border style with hover effect
- Gradient icon backgrounds
- Scale animation on hover
- Grid layout (2 columns)

### 5. Tables (Users Page)

**Design:**
- White background with rounded corners
- Search bar at top
- Header with gray background
- Hover effect on rows
- Avatar circles with gradients
- Role badges with icons
- Status indicators with dots

### 6. Forms (Settings Page)

**Layout:**
- Sectioned cards
- Icon headers with colored backgrounds
- Input fields with rounded corners
- Checkbox with custom styling
- Save button with gradient

### 7. Reports Page

**Cards:**
- Grid layout (3 columns)
- Icon with colored background
- Description text
- Generate button with gradient
- Hover effects with scale

## Icon System

**Using Lucide React:**

```javascript
import { 
  Shield,        // Security/Admin
  Users,         // User management
  TrendingUp,    // Analytics/Growth
  Settings,      // Configuration
  FileText,      // Reports/Documents
  Bell,          // Notifications
  LogOut,        // Logout
  Calendar,      // Date/Time
  Lock,          // Security
  Mail,          // Email
  Eye, EyeOff,   // Password visibility
  // ... and more
} from 'lucide-react';
```

**Icon Sizes:**
- Small: `w-4 h-4` (16px)
- Medium: `w-5 h-5` (20px)
- Large: `w-6 h-6` (24px)
- Extra Large: `w-8 h-8` (32px)

## Animations & Transitions

**Hover Effects:**
```css
transition-all duration-200
hover:shadow-md
hover:scale-110
group-hover:text-[#975a20]
```

**Loading States:**
```css
animate-spin (for spinners)
disabled:opacity-50
disabled:cursor-not-allowed
```

**Smooth Transitions:**
```css
transition-colors
transition-transform
transition-shadow
```

## Shadows

**Card Shadows:**
- Default: `shadow-sm`
- Hover: `shadow-md`
- Elevated: `shadow-lg`

**Colored Shadows:**
```css
shadow-lg shadow-[#975a20]/20
```

## Responsive Design

**Breakpoints:**
- Mobile: Default (< 640px)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

**Grid Layouts:**
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```

**Sidebar:**
- Hidden on mobile (can add hamburger menu)
- Visible on desktop

## Best Practices

1. **Consistency:** Use the same spacing, colors, and border radius throughout
2. **Accessibility:** Proper contrast ratios, focus states, and ARIA labels
3. **Performance:** Optimize images, use CSS transforms for animations
4. **Responsiveness:** Test on multiple screen sizes
5. **Icons:** Use Lucide React for consistent icon style
6. **Gradients:** Apply to primary actions and branding elements
7. **White Space:** Don't overcrowd, use proper spacing
8. **Feedback:** Show loading states, success/error messages

## Color Usage Guidelines

**Primary Gradient (#975a20):**
- Primary buttons
- Active navigation items
- Important badges
- Logo/branding elements
- Call-to-action elements

**White Background:**
- Cards
- Sidebar
- Header
- Form inputs

**Gray Tones:**
- Text (gray-600, gray-700, gray-900)
- Borders (gray-200, gray-300)
- Backgrounds (gray-50, gray-100)

**Accent Colors:**
- Success messages: Green
- Error messages: Red
- Info messages: Blue
- Warnings: Purple/Orange

## Component Checklist

✅ Login Page - Split screen with gradient
✅ Header - Sticky with user info
✅ Sidebar - Navigation with icons
✅ Dashboard - Stats cards and activity
✅ Analytics - Metrics and charts
✅ Users - Table with search
✅ Reports - Grid of report cards
✅ Settings - Sectioned forms

---

All components use Lucide React icons and follow the #975a20 gradient color scheme with white theme!
