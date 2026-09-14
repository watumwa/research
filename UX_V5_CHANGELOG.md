# V5 — Simple UX completion pass

The V5 pass was built around one rule: **the learner should always know where they are, what to do next, and never see a control that does nothing.**

## Critical UX items completed

- Responsive logged-in navigation with a mobile hamburger drawer.
- Working global search across courses, lessons, resources and builders.
- Real in-app notifications with unread counts, mark-read and deep links.
- Previous/next lesson navigation plus course position and progress.
- Practice answers autosave to Django per learner and lesson.
- Checkout redesigned around payment method, phone validation, submitted/pending/paid/failed states and account-linked payment history.

## High-priority items completed

- Two-step onboarding after first registration.
- Larger, more readable typography in the logged-in learning experience.
- Skeleton loading states for major API-driven screens.
- Global toast feedback for important saves, completions and errors.
- Inline registration and password validation.
- Show/hide password controls and password-strength guidance.
- Terms and Privacy agreement during signup, with public Terms and Privacy pages.
- Email verification flow, verification page and resend action.
- Strong "Continue" action on course and dashboard pages.
- Collapsible course modules with completion counts.

## Medium/polish items completed

- Resource search, Free/Premium/My Access filters and sorting.
- Personalized dashboard recommendation and most recent activity.
- Learner milestones derived from real progress, builder work and premium access.
- Expanded profile: learning focus, learner type, organization, notification preference, email status and security.
- Admin search/filtering, payment approval, account enable/disable, pagination and course-engagement bars.
- Accessibility pass: visible keyboard focus, larger touch targets, responsive layouts, semantic labels and reduced-motion support.
- Logged-in visual system refined to match the restrained editorial identity of the public homepage.
- Helpful empty states with actions.
- Breadcrumbs on deep learning/account pages.
- Restrained hover/save/completion microinteractions.

## Simplicity decisions

V5 intentionally avoids adding unnecessary menus and widgets. The learner navigation is reduced to:

1. Home
2. Research
3. Communication
4. Builders
5. Resources
6. Profile

The dashboard leads with one recommended next action instead of many competing cards. Onboarding has only two questions. Course modules collapse when not needed. Lesson pages use the page itself as the reading canvas rather than putting every paragraph inside a card.

## Backend additions

- `User.learning_goal`
- `User.learner_level`
- `User.onboarding_completed`
- `User.email_verified`
- `User.notification_preferences`
- `LessonPractice`
- `Notification`
- Global search API
- Notification APIs
- Lesson-practice autosave API
- Email-verification APIs
- Admin filtering and user-status endpoint
- Course resume and lesson navigation data
- Dashboard milestones and recommendations

Fresh setup runs `makemigrations` automatically. Existing installations should run migrations after replacing the source.
