# Agent Rules for Onwynd (Next.js App Router)

You are a strict code-generation agent for the Onwynd mental health platform.

## Core Rules
- ALWAYS generate REAL, COMPLETE, and RUNNABLE code.
- NEVER output placeholders, pseudocode, or comments like "you can add this later".
- NEVER skip files. If a file is referenced, create it fully.
- NEVER summarize code. Always write the full file contents.
- NEVER assume files exist unless verified or already created.
- ALWAYS test that code runs with `yarn dev` before completing tasks.

 BY FOLLOWING THE RULES Core Rules 

 

 don't tamper with the UI 

 

 ALWAYS generate REAL, COMPLETE, and RUNNABLE code. 

 

 NEVER output placeholders, pseudocode, or comments like "you can add this later". 

 

 NEVER skip files. If a file is referenced, create it fully. 

 

 NEVER summarize code. Always write the full file contents. 

 

 REUSE THE EXISTING COMPONENTS, DESIGNS, WIDGETS, TABS, ETC. DON'T FORCE CREATE A UI DESIGN. SEE WHAT EXISTS AND REUSE IT, AND IMPROVISE. NO REDUNDANCY OR DUPLICATE FILES

## Project Context
| Property | Value |
|----------|-------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Build Tool | Turbopack |
| Component Library | shadcn/ui |
| CSS Framework | Tailwind CSS v4 |
| State Management | Zustand |
| API Client | TanStack Query (React Query) |
| Charting | Recharts |
| Authentication | jose |
| Server Runtime | Node.js v20 |
| Package Manager | yarn |
| Icon Library | Lucide Icons |
| Directory Structure | Root-level (no `src/`) |
| Components Directory | `components/` |
| Pages Directory | `app/` |
| Utilities Directory | `lib/` |
| Type Definitions | `types/` |
| Hooks Directory | `hooks/` |
| Mock Data | `mock-data/` |
| Store (State) | `store/` |

## Responsive Design Rules
- The design has BOTH mobile and desktop versions for most pages
- Use Tailwind's responsive breakpoints (sm, md, lg, xl, 2xl)
- Mobile-first approach: base styles are mobile, use `md:` prefix for desktop
- Some pages have different layouts between mobile and desktop
- Test breakpoint: md = 768px (tablet and up)

## Layout Variations
- Different pages may have different header designs
- Different pages may have different footer designs
- Create flexible header/footer components that accept variants
- Use layout composition for page-specific headers/footers

## File Handling Rules
- If creating a component, place it in `components/ComponentName.tsx`
- If creating page-specific components, place in `components/[page-name]/ComponentName.tsx`
- If creating a dashboard role component, place in `components/[role]-dashboard/ComponentName.tsx`
- If creating a layout, place in `app/layout.tsx` or `app/[route]/layout.tsx`
- If creating a new route, place in `app/[route]/page.tsx`
- If creating role-based routes, use route groups: `app/(role-name)/page.tsx`
- If creating utilities, place in `lib/utilities-name.ts` or `lib/[category]/file.ts`
- If creating custom hooks, place in `hooks/use-hook-name.tsx`
- If creating types, place in `types/name.ts` or update existing type files
- If creating Zustand stores, place in `store/store-name.ts`
- Always include correct imports and exports
- Do not use `src/` directory - all files are at the root level
- Route groups (parentheses) create layout boundaries but don't affect URL paths

## Component Structure
- Create reusable components in `components/`
- Create page-specific components in `components/[page-name]/`
- Create dashboard-specific components in `components/[role]-dashboard/`
- One component per file, unless creating small sub-components
- Use TypeScript interfaces for all props, define as `interface ComponentProps { }`
- Export components as default exports
- Use named exports for utility functions and hooks
- Keep components focused and single-responsibility
- Use shadcn/ui components as the base for UI elements
- For shared components across dashboards, place in `components/shared/`

## Styling Rules
- Use Tailwind CSS utility classes only
- Do NOT use inline styles
- Do NOT use external CSS files unless explicitly instructed
- Use Tailwind's arbitrary values `[value]` when exact design specs are needed
- Color palette should match the Figma design (browns, oranges, greens, creams)

## Fidelity Rules
- Match the Figma design as closely as possible:
  - spacing (use Tailwind spacing scale)
  - font sizes (text-xs, text-sm, text-base, text-lg, text-xl, etc.)
  - layout structure
  - colors (extract from design)
  - border radius
  - shadows
- Prefer semantic HTML where possible (header, nav, main, section, article, footer)

## Route Structure
The app uses role-based routing with route groups. Each role has its own dashboard:

**Public Routes:**
- `/` - Public homepage
- `/auth/*` - Authentication pages

**Role-Based Dashboards (Route Groups):**
- `/(admin)` - Admin dashboard
- `/(ambassador)` - Ambassador dashboard
- `/(patient)` - Patient dashboard
- `/(therapist)` - Therapist dashboard
- `/(clinical)` - Clinical dashboard
- `/(employee)` - Employee dashboard
- `/(health)` - Health personnel dashboard
- `/(manager)` - Manager dashboard
- `/(product)` - Product dashboard
- And other role-specific dashboards as needed

**Route Group Pattern:**
- Use `app/(role-name)/` for role-specific pages
- Use `app/(role-name)/layout.tsx` for role-specific layouts
- Route groups don't appear in URLs but provide layout isolation
- Each role can have its own header, sidebar, and footer variations

**Shared Routes:**
- Use `app/` root for public pages
- Use middleware to redirect authenticated users to role-specific dashboards

## Navigation Rules
- Main Menu should be a component that works on both mobile and desktop
- Mobile menu likely uses a hamburger icon
- Desktop menu likely uses a horizontal navigation
- Use Next.js Link component for internal navigation
- Implement mobile menu toggle with React state

## Authentication & Authorization Rules
- Use middleware.ts to handle route protection and role-based redirects
- Implement role checks before rendering dashboards
- Store authentication tokens securely (use httpOnly cookies when possible)
- Use jose for JWT validation
- Implement logout that clears auth state and redirects to auth routes
- Check user role before displaying role-specific components
- Use route groups to isolate authenticated routes from public routes

## State Management (Zustand) Rules
- Create separate stores for different domains (auth, user, ui, etc.)
- Store names: `store/auth-store.ts`, `store/ui-store.ts`, etc.
- Use composable stores for complex state
- Update state immutably
- Devtools: Add persist middleware for localStorage persistence when needed
- Keep store logic focused and domain-specific
- Export hooks like `useAuthStore`, `useUIStore`, etc.

## API & Data Fetching Rules
- Use TanStack Query for server state management
- Create custom hooks in `hooks/` that wrap useQuery/useMutation
- Cache queries by endpoint and parameters
- Implement error handling with error boundaries and toast notifications
- Use API routes in `app/api/` for backend operations if needed
- Use lib/api.ts or lib/services/ for API calls
- Implement retry logic for failed requests (use React Query's retry options)
- Handle loading and error states appropriately

## Form Handling Rules
- Use React Hook Form for form state management
- Use shadcn/ui form components
- Validate with Zod or similar TypeScript-first validation
- Store form schemas in types/ or components/forms/ directories
- Implement proper error display and field-level validation
- Use `<form>` elements with `onSubmit` handlers
- Implement loading states during submission

## Error Handling Rules
- Use ErrorBoundary component for catch errors within component trees
- Implement error.tsx files in each route group for route-level error handling
- Display user-friendly error messages in UI
- Log errors for debugging (implement error logging middleware)
- Use try-catch for async operations
- Provide fallback UI for error states
- Implement proper error messages in API responses

## Styling Rules
- Use Tailwind CSS utility classes only
- Do NOT use inline styles
- Do NOT use external CSS files unless explicitly instructed
- Use Tailwind's arbitrary values `[value]` when exact design specs are needed
- Color palette should match the Figma design (browns, oranges, greens, creams)
- Use Tailwind's responsive prefix for mobile-first design (sm:, md:, lg:, etc.)
- Dark mode support via theme-provider.tsx if implemented

## Performance Rules
- Use Next.js Image component for optimization
- Implement proper loading states
- Use React Server Components by default
- Only use Client Components (`'use client'`) when interactivity is needed
- Lazy load heavy components when appropriate
- Implement code splitting for large dependencies
- Optimize bundle size by tree-shaking unused code
- Use Next.js font optimization
- Minimize re-renders with proper React.memo for expensive components

## TypeScript Rules
- Use strict TypeScript
- Define interfaces for all component props as `interface ComponentProps { }`
- Use proper typing for all functions
- Avoid `any` type - use `unknown` if needed
- Export types alongside components when shared
- Use type narrowing for conditional logic
- Implement generics for reusable typed utilities

## Server Actions & Client/Server Boundary Rules
- Use Server Components by default for data fetching
- Mark interactive components with `'use client'`
- Create Server Actions in `'use server'` sections for mutations
- Keep business logic in Server Actions
- Use proper error handling in Server Actions
- Pass only serializable data from Server Components to Client Components
- Use async functions for Server Actions

## Testing Rules
- Unit tests in `__tests__/components/`
- Test critical paths and user interactions
- Use mocked API responses from mock-data/
- Test error states and edge cases
- Run tests with appropriate coverage thresholds

## Environment & Configuration Rules
- Use `.env.local` for local environment variables
- Store sensitive keys in `.env.local` (never commit)
- Use `lib/config.ts` for application-level configuration
- Create typed config that exports constants
- Use environment variables for feature flags
- Implement different configs for dev, staging, production if needed

## Accessibility Rules
- Use semantic HTML elements (header, nav, main, section, article, footer)
- Include proper ARIA labels where needed
- Ensure keyboard navigation works
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Test with screen readers for critical user paths
- Use proper color contrast ratios
- Implement focus states for interactive elements

## Output Rules
- Write code directly into files
- Use TypeScript with proper typing
- Ensure the app runs with `yarn dev` without errors
- Include all necessary imports
- Follow Next.js 16+ conventions
- Follow the project's existing code style and patterns
- Use proper formatting and indentation

You must follow these rules strictly. Every file you create must be complete and production-ready.