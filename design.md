# Functional Bodybuilding Coach Design Plan

## Product Direction

This mobile product is designed for **functional bodybuilding athletes** who want the hypertrophy and structural balance of bodybuilding combined with the movement variety, work capacity, and skill flavor of CrossFit-style training. The app is intentionally optimized for **portrait mobile use**, **one-handed interaction**, and a visual experience that feels closer to a premium iOS coaching product than to a generic workout tracker. The interaction model should emphasize low-friction daily use: the user opens the app, understands the plan immediately, starts the session quickly, logs results without cognitive overload, and gives simple feedback that influences tomorrow’s prescription.

The visual language should combine **performance credibility** with **editorial polish**. The interface should use layered cards, strong spacing rhythm, soft gradients, restrained motion, and clear hierarchy inspired by high-end fitness case studies commonly seen in modern mobile design showcases. The product should feel energetic and aspirational without becoming visually noisy. Every primary task should be reachable within one or two taps from the main screen, and bottom-sheet interactions should be favored over deep navigation when that reduces friction.

## Screen List

| Screen | Purpose | Notes |
|---|---|---|
| Splash / Entry | Establish brand and route returning users | Minimal branded loading state with fast handoff to auth or dashboard |
| Auth | Sign in, create account, continue demo, recover access | Should feel welcoming rather than administrative |
| Onboarding Step 1: Identity | Capture training level and goal orientation | Goal emphasis: muscle gain, mixed performance, conditioning bias |
| Onboarding Step 2: Training Background | Collect years training, current frequency, CrossFit exposure, injuries, weak points | Structured to support programming logic |
| Onboarding Step 3: Equipment & Schedule | Capture available equipment, session length, training days, preferred split | Enables adaptive constraints |
| Onboarding Step 4: Recovery & Preferences | Capture sleep, soreness tolerance, exercise likes/dislikes, movement confidence | Shapes progression and substitutions |
| Home / Today | Present daily training, readiness summary, and quick start | The most important screen in the app |
| Session Detail | Show warm-up, strength, accessory, metcon, cooldown, and intent | Includes movement notes and loading targets |
| Live Workout Logger | Let user record sets, reps, load, effort, and notes during training | Designed for fast thumb entry |
| Post-Workout Review | Capture RPE, pump, fatigue, enjoyment, pain flags, and completion quality | Drives next-day adaptation |
| Progress / History | Show streaks, volume, recent loads, movement trends, and adherence | Simple insights, not spreadsheet clutter |
| Profile / Preferences | Edit onboarding data, recovery settings, and equipment access | Also contains logout and program reset |

## Primary Content and Functionality

The **Auth** experience should prioritize trust and momentum. It should include a primary sign-in action, a secondary create-account action, and a graceful demo path if needed during development. The page should visually reinforce the product promise with concise copy about adaptive functional bodybuilding. The **Onboarding** flow should use progressive disclosure so the user answers short, high-value questions instead of facing a long intimidating form. Each step should show progress, preserve entered data, and communicate why the information matters for programming.

The **Home / Today** screen should act as the coaching command center. It should display the training day focus, estimated duration, readiness banner, phase context within the current cycle, and a concise summary of why today’s session looks the way it does. The **Session Detail** screen should structure training into clearly separated blocks: preparation, primary strength or bodybuilding emphasis, secondary superset or structural work, conditioning or skill finisher, and recovery. Each block should include coaching intent, prescribed effort, and scaling options.

The **Live Workout Logger** should allow fast set-by-set entry with large tap targets, inline completion states, optional timers, and low-friction note capture. The **Post-Workout Review** should transform subjective feedback into a simple coaching signal using sliders, segmented controls, and recovery prompts. The **Progress** area should show only decision-useful metrics such as completed sessions, movement exposure, estimated strength trends, and fatigue patterns. The **Profile** area should allow the user to update constraints that meaningfully affect future programming.

## Key User Flows

| Flow | Step-by-step path |
|---|---|
| First-time setup | User opens app -> views premium welcome screen -> signs up or signs in -> completes 4-step onboarding -> receives first personalized training day |
| Daily training start | User opens app -> lands on Today screen -> reviews session summary -> taps Start Session -> enters Session Detail -> begins logging |
| Workout logging | User completes a movement block -> enters sets/reps/load/RPE -> marks block complete -> advances to next block -> submits post-workout review |
| Adaptive improvement | User submits feedback on fatigue, difficulty, soreness, pain, and enjoyment -> engine updates readiness and progression signals -> next day adjusts volume, intensity, exercise choice, or conditioning dose |
| Plan refinement | User edits equipment access, time availability, or weak points in Profile -> future sessions regenerate around new constraints |

## Periodization and Programming Model

The app should be built around **structured functional bodybuilding periodization**, not random daily variety. The default engine should organize training into repeating microcycles with a clear hypertrophy and structural balance foundation, while layering in controlled mixed-modal conditioning and athletic movement exposure. A practical baseline is a **4-week wave** in which volume accumulates during weeks one and two, intensity or density peaks during week three, and week four serves as a controlled deload or resensitization week. Daily prescriptions should balance upper and lower body exposure, movement pattern coverage, unilateral work, trunk integrity, and carefully dosed conditioning so recovery remains sustainable.

Each daily session should be assembled from a stable framework: movement preparation, primary strength or hypertrophy piece, secondary structural superset, optional CrossFit-influenced mixed piece, and cooldown. Adaptation should respond to both objective and subjective signals. If the user consistently reports high fatigue, missed reps, elevated soreness, pain flags, or lower-than-target completion, the next day should reduce density, simplify movement complexity, or substitute less systemically fatiguing options. If the user reports strong recovery, high adherence, and successful execution, the app can progress load, volume, or skill challenge conservatively. The experience should feel like a coach making thoughtful adjustments, not like an algorithm chasing novelty.

## Color Choices

| Token | Color | Role |
|---|---|---|
| Primary | `#7C3AED` | Electric violet for primary actions and brand distinction |
| Secondary Accent | `#14B8A6` | Teal for readiness, progression, and positive training signals |
| Highlight | `#F97316` | Energy accent for active session states and key metrics |
| Background | `#0B1020` | Deep navy-charcoal for premium contrast and focus |
| Surface | `#141A2E` | Elevated card background |
| Surface Soft | `#1B2440` | Secondary panels and chart surfaces |
| Text Primary | `#F8FAFC` | High-contrast primary text |
| Text Muted | `#94A3B8` | Supporting labels and secondary details |
| Border | `#24304D` | Soft dividers and control outlines |
| Success | `#22C55E` | Completion and positive recovery markers |
| Warning | `#F59E0B` | Fatigue cautions and moderate readiness flags |
| Error | `#EF4444` | Pain alerts and failed logging states |

These colors should be used with subtle gradients rather than flat saturation everywhere. The overall appearance should feel premium, athletic, and modern, while preserving accessibility through strong contrast and disciplined accent usage.

## UX Principles for Implementation

The UX should favor **clarity before decoration**. Information density must stay controlled, with each screen designed around one primary action. The app should use persistent visual cues for progression, completion, and readiness without turning the interface into a dashboard overload. Cards should have generous corner radii, tight copy hierarchy, and restrained animation. Major actions should use haptics and subtle scale feedback, while transitions should remain quick and calm.

The onboarding and logging experiences should be intentionally simple because those are the points where users often abandon training apps. Inputs should rely on segmented controls, sliders, chips, and step selectors more than free-form typing. Bottom navigation should expose only the core areas: **Today**, **Progress**, and **Profile**. Advanced detail should be nested inside sheets and drill-down views rather than extra tabs. This keeps the product easy to learn while still feeling rich enough to support a serious training practice.
