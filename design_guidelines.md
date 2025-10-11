# Construction Materials Catalog - Design Guidelines

## Design Approach

**Hybrid Approach**: Material Design System as foundation, with marketplace aesthetics inspired by Alibaba, BuildDirect, and Airbnb's card-based layouts. This balances the utility-focused nature of a B2B catalog with the visual appeal needed for product showcasing.

**Core Principles**:
- **Industrial Trust**: Professional, robust design that conveys reliability for construction industry
- **Visual Clarity**: Product imagery and information hierarchy prioritized
- **Efficient Discovery**: Powerful filters and search without overwhelming users
- **Cultural Sensitivity**: Design elements that resonate with Ethiopian market

---

## Color Palette

### Light Mode
- **Primary**: 25 70% 45% (Construction orange - warm, industrial, energetic)
- **Primary Hover**: 25 70% 40%
- **Secondary**: 210 15% 30% (Charcoal gray - professional, stable)
- **Background**: 0 0% 98%
- **Surface**: 0 0% 100%
- **Border**: 0 0% 88%
- **Text Primary**: 0 0% 15%
- **Text Secondary**: 0 0% 45%

### Dark Mode
- **Primary**: 25 65% 55%
- **Primary Hover**: 25 65% 60%
- **Secondary**: 210 20% 65%
- **Background**: 0 0% 10%
- **Surface**: 0 0% 14%
- **Border**: 0 0% 25%
- **Text Primary**: 0 0% 95%
- **Text Secondary**: 0 0% 70%

### Accent Colors (Minimal Use)
- **Success**: 145 60% 45% (for posted/verified badges)
- **Warning**: 45 90% 55% (for price highlights)

---

## Typography

**Font Stack**:
- **Primary**: Inter (Google Fonts) - clean, professional, excellent multilingual support
- **Headings**: Poppins (Google Fonts, weights: 600, 700) - bold, modern
- **Amharic Support**: Noto Sans Ethiopic (Google Fonts) for Amharic text

**Scale**:
- Hero Headline: text-5xl md:text-6xl font-bold (Poppins)
- Section Titles: text-3xl md:text-4xl font-semibold (Poppins)
- Card Titles: text-xl font-semibold (Inter)
- Body Text: text-base (Inter)
- Captions/Meta: text-sm text-secondary (Inter)
- Micro Labels: text-xs uppercase tracking-wide (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- **Component Spacing**: gap-4, gap-6 for grids and flexbox
- **Section Padding**: py-16 md:py-24 for major sections
- **Card Padding**: p-4 to p-6 internally
- **Container**: max-w-7xl mx-auto px-4 for main content areas

**Grid Patterns**:
- **Product/Company Cards**: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6
- **Category Icons**: grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4
- **Filter Sidebar**: Fixed 280px width on desktop, slide-over on mobile

---

## Component Library

### Header (Fixed Position)
- **Height**: h-16 md:h-20
- **Layout**: Logo (left), Search bar (center, max-w-2xl), Auth/Profile (right)
- **Background**: Surface color with subtle border-b
- **Search**: Prominent search with icon, rounded-full, shadow on focus
- **Profile Dropdown**: Avatar with dropdown menu (Edit Profile, Register Company, Logout)

### Sidebar Menu (Slide-out)
- **Width**: w-72 on open
- **Animation**: slide-in-from-left
- **Items**: Icon + label pairs, active state with primary color left border
- **Language Toggle**: Toggle switch at bottom (EN ⇄ አማ)

### Product Cards
- **Design**: Clean card with image (aspect-ratio-square), hover lift effect (translate-y-1)
- **Image**: Rounded-t-lg, cover fit
- **Content Section**: p-4, Product name (font-semibold), Company name (text-sm text-secondary), Price (text-lg font-bold primary color), Category badge
- **Hover**: Shadow elevation increase, subtle scale (scale-102)

### Company Cards
- **Design**: Horizontal or vertical card with logo (rounded-full, 80x80px)
- **Content**: Company name (text-xl font-semibold), Short description (2 lines truncated), Location with pin icon, Product count badge
- **Background**: Surface color with border

### Product Detail Modal
- **Layout**: Two-column on desktop (image gallery left 50%, details right 50%)
- **Gallery**: Main image + thumbnail strip below (4-5 thumbnails), lightbox capability
- **Details Panel**: Product name, company (clickable link), category tag, price (large, bold), specifications grid (unit, made of), full description
- **Actions**: If owner - Edit/Delete buttons (outline variant), else - Contact/Inquiry button

### Company Detail Modal
- **Header**: Logo + company name + location
- **Tabs**: Overview | Products | Contact
- **Overview**: Full description, map embed (rounded-lg, h-64), key stats
- **Products Tab**: Grid of products from this company
- **Edit Controls**: Only visible to owner, sticky at top

### Filters Panel
- **Categories**: Checkbox list with product count indicators
- **Price Range**: Dual-thumb slider with min/max inputs
- **Unit Filter**: Dropdown select
- **Location** (Companies): Autocomplete search
- **Apply/Reset**: Fixed bottom bar with buttons

### Category Icons/Cards (Home Page)
- **Design**: Rounded square cards (aspect-square) with icon + label
- **Icons**: Material Icons (Heroicons) for categories - use cement, steel, wood, tile, paint symbols
- **Layout**: 6 columns on desktop, 3 on tablet, 3 on mobile
- **Hover**: Background tint with primary color

---

## Page-Specific Designs

### Home Page
- **Hero Section**: Full-width, h-[500px], background image of Ethiopian construction site (modern building, cranes, bright sky)
  - Centered content: Large headline "Find Quality Construction Materials" (white text with subtle text-shadow)
  - Search bar: Large, rounded-full, white background with shadow-xl
  - Toggle Pills: Below search - "Browse Products" / "Browse Companies" (segmented control style)
  
- **Categories Section**: py-20, "Popular Categories" heading, 6-column grid of category cards

- **Featured Products**: py-16, "Recently Added Materials" carousel or 4-column grid preview

### Browse Products Page
- **Layout**: Sidebar filters (left, 280px) + Main grid (flex-1)
- **Top Bar**: Search + sort dropdown (Latest, Price Low-High, Price High-Low) + view toggle (grid/list)
- **Floating Action Button**: "Add Product" button, fixed bottom-right, rounded-full, shadow-2xl, primary color (only for logged-in users)

### Browse Companies Page
- **Layout**: Similar to products but with map view option
- **Card Style**: Larger cards with more company info visible
- **Map Integration**: Option to toggle split view (list left, map right with markers)

### About Page
- **Hero**: Smaller, h-80, gradient overlay on image
- **Content**: Two-column (text + image), team section (if applicable), contact form (right column) + info + map (left column)
- **Map**: Google Maps embed, rounded-lg, h-96, showing office location

---

## Imagery Requirements

### Hero Image
- Large, high-quality image of Ethiopian construction site
- Modern building under construction with cranes, blue sky
- Bright, optimistic feel conveying growth and development
- Image overlay: dark gradient (bottom to top) for text legibility

### Product Images
- Well-lit product photography on neutral backgrounds
- Multiple angles for gallery (minimum 3 images)
- Square aspect ratio (1:1) for consistency in grids

### Company Logos
- Circular avatars, 80x80px minimum
- White or transparent backgrounds
- High contrast for dark mode compatibility

### Category Icons
- Use Heroicons or Material Icons via CDN
- Construction-related: hammer, cement mixer, steel beam, wood plank, paint roller, tile
- Consistent stroke weight, 48x48px base size

---

## Interactions & Animations

**Minimize animations, use purposefully**:
- Card hover: Subtle lift (translate-y-1) + shadow increase, 200ms ease
- Modal open/close: Fade + scale (scale-95 to scale-100), 300ms
- Sidebar: Slide-in transform, 250ms ease-out
- Filter apply: Subtle loading state on product grid
- Image gallery: Smooth crossfade, 200ms

**No animations on**:
- Text content
- Form interactions (beyond standard focus states)
- Page transitions

---

## Accessibility & Responsiveness

- Maintain consistent dark mode across all inputs and modals
- Color contrast ratio minimum 4.5:1 for all text
- Focus indicators: 2px ring with primary color offset
- Mobile-first breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch targets minimum 44x44px on mobile
- Bilingual text sizing adjusted for Amharic script (slightly larger line-height)

---

This design creates a professional, trustworthy marketplace specifically tailored for Ethiopia's construction industry while maintaining modern web standards and excellent usability.