# NXpay Broadcast Production Workspace

## Goal
Build a responsive, dark broadcast-studio workspace with real account, profile, and production-session data, while clearly separating implemented workflows from future video infrastructure.

## Product experience
- Replace the template home screen with an NXpay overview and working sign-up/sign-in entry points.
- Add email/password authentication, a user profile with display name, and a signed-in navigation shell.
- Add dashboard and production-session screens with real create, rename, open, and delete actions; sessions are privately owned and identified by unique IDs.
- Add camera connection, live production studio, livestream management, recordings library, and account settings screens. These provide honest connection/readiness states and real saved metadata where available; no camera transport, composition, recording, or streaming is simulated.
- Use reusable broadcast-oriented UI for camera tiles, monitors, controls, status, dialogs, and notifications.

## Technical approach
- Enable Lovable Cloud and email/password sign-in.
- Add a database migration for profiles, production sessions, and recording metadata, with explicit grants, row-level security, and a profile-on-signup trigger.
- Use the generated Cloud auth client and authenticated access patterns; keep owner checks in database policies.
- Build top-level public landing and auth routes, plus protected signed-in routes for the workspace pages.
- Establish a small modular structure for session data operations, shared production UI, and route views; record the structural decision in `AGENTS.md`.
- Define a semantic dark broadcast-studio design system in `src/styles.css` and give every content route unique metadata.

## Verification
- Run relevant routing/auth/session tests and the preview build checks.
- Exercise session create, rename, open, and delete through the signed-in UI, and verify the stored results read back.
- Confirm camera, live, and recording screens communicate that actual media infrastructure is not yet connected.
