# 💳 GetYourCard

### AI Assisted Fintech Eligibility & Credit Card Discovery Platform

> **A GenAI assisted fintech MVP that simplifies credit card discovery, eligibility assessment, application, and status tracking.**

**[Live Demo](https://getyourcard.vercel.app/)**

---

## ✦ Product Snapshot

|                 |                                |
| --------------- | ------------------------------ |
| **Product**     | GetYourCard                    |
| **Category**    | Fintech                        |
| **Version**     | 1.0                            |
| **Stage**       | MVP • Demo                     |
| **Platform**    | Web • Mobile                   |
| **Role**        | Product • Design • Development |
| **Prepared by** | Krusnansh Gupta                |
| **Development** | GenAI Assisted                 |

---

# 🎯 The Product

GetYourCard is designed to answer one simple question:

> **"Which credit card is right for me?"**

Instead of forcing users to understand complex eligibility criteria across multiple platforms, GetYourCard creates a simple journey:

```text
👤 User Profile
      ↓
📝 Eligibility Assessment
      ↓
⚡ Eligibility Evaluation
      ↓
💳 Card Recommendations
      ↓
📄 Application
      ↓
📊 Application Tracking
```

---

# 🔎 Why This Product?

### The Problem

Credit card discovery can be unnecessarily complicated.

Users often face:

| User Pain Point              | Impact                                  |
| ---------------------------- | --------------------------------------- |
| Complex eligibility criteria | Difficult to know which card to choose  |
| Too many card options        | Decision fatigue                        |
| Limited transparency         | Users do not understand recommendations |
| Poor application visibility  | Uncertainty after applying              |
| Aggressive lead generation   | Unwanted calls and spam                 |

### Product Opportunity

Build a **simple, transparent, guided credit card discovery experience**.

---

# 👥 Target Users

### 🧑 First Time Applicant

**18–25 years**

Limited credit history and little knowledge of financial products.

**Core question:**

> "Which card can I apply for?"

---

### 💼 Existing Credit Card User

**18–40 years**

Already has basic credit experience and wants better rewards or benefits.

**Core question:**

> "Which card should I upgrade to?"

---

### 🛠️ Admin / Operator

Internal user responsible for managing applications and leads.

**Core question:**

> "How can I efficiently manage and update applications?"

---

# 🧠 Product Strategy

The MVP focuses on reducing friction across the credit card journey.

### From this:

```text
Search
  ↓
Compare
  ↓
Understand eligibility
  ↓
Visit multiple platforms
  ↓
Apply
  ↓
Wait without visibility
```

### To this:

```text
Profile
  ↓
Eligibility
  ↓
Recommendation
  ↓
Application
  ↓
Status Tracking
```

**Design principle:**

### Less searching. More decision confidence.

---

# ✨ Core Experience

## 01 • Eligibility Assessment

Users answer a short set of questions covering relevant profile information.

**Goal:** Complete the assessment in **under 2 minutes**.

---

## 02 • Smart Card Matching

A deterministic rules engine evaluates the user's inputs and identifies suitable cards.

### Example

```text
Income
   +
Credit History
   +
User Profile
   +
Card Preference
   ↓
Eligibility Rules
   ↓
Recommended Cards
```

Recommendations are designed to be **explainable rather than opaque**.

---

## 03 • Application

Once users find a suitable card, they can continue directly to the application flow.

**Journey:**

`Recommendation → Login → Application → Confirmation`

---

## 04 • Application Tracking

Users receive a centralized dashboard showing their applications and current status.

### Status Lifecycle

```text
📝 Applied
    ↓
🔍 Under Review
    ↓
    ├── ✅ Approved
    └── ❌ Rejected
```

---

# 🖥️ Product Architecture

```text
                         GETYOURCARD
                              │
              ┌───────────────┴───────────────┐
              │                               │
          USER EXPERIENCE                 ADMIN EXPERIENCE
              │                               │
       Eligibility Flow                  Admin Login
              │                               │
       Recommendation                   Dashboard
              │                               │
        Card Application                 Applications
              │                               │
       User Dashboard                    Status Updates
              │                               │
              └───────────────┬───────────────┘
                              │
                        FIREBASE LAYER
                    ┌─────────┴─────────┐
                    │                   │
               Authentication       Firestore
                    │                   │
                    └─────────┬─────────┘
                              │
                           VERCEL
```

---

# 👤 User Journey

| Stage | User Action              | Product Response               |
| ----- | ------------------------ | ------------------------------ |
| 01    | Opens platform           | Understands value proposition  |
| 02    | Starts eligibility check | Enters basic information       |
| 03    | Completes assessment     | Rules engine evaluates profile |
| 04    | Views recommendations    | Suitable cards displayed       |
| 05    | Selects card             | Application flow begins        |
| 06    | Authenticates            | Account created / accessed     |
| 07    | Applies                  | Application stored             |
| 08    | Opens dashboard          | Tracks application status      |

---

# 🔐 Authentication

Authentication is powered by **Firebase Authentication**.

### Supported Methods

* Google Sign In
* Passwordless Email / Magic Link

### Access Model

```text
USER
 └── Own profile
 └── Own applications

ADMIN
 └── All applications
 └── Lead management
 └── Status management
```

---

# 🛠️ Technology Stack

| Layer          | Technology              |
| -------------- | ----------------------- |
| Frontend       | React / Next.js         |
| Styling        | Tailwind CSS            |
| Authentication | Firebase Authentication |
| Database       | Firebase Firestore      |
| Hosting        | Vercel                  |
| Development    | GenAI Assisted          |
| Analytics      | Event Tracking          |
| Version        | MVP Demo                |

---

# 🤖 GenAI Assisted Product Development

GenAI was used as a **product development accelerator**, not simply as a coding tool.

### Product

* PRD structuring
* User personas
* User stories
* Feature definition
* Product flows
* Edge case identification

### Design

* UX concepts
* UI copy
* Error states
* Onboarding flows
* Interaction ideas

### Engineering

* React components
* Firebase integration
* Authentication flows
* Firestore structures
* Eligibility logic
* Debugging
* Code iteration

### Human in the Loop

```text
GENAI
  ↓
Generate
  ↓
Review
  ↓
Validate
  ↓
Modify
  ↓
Implement
  ↓
Test
```

GenAI outputs were reviewed and validated before being incorporated into the MVP.

---

# 📐 UX Principles

### 01. Minimal Cognitive Load

Users should understand what to do without needing financial expertise.

### 02. Mobile First

The eligibility journey is designed around a fast mobile experience.

### 03. Progressive Disclosure

Only relevant information is shown at each stage.

### 04. Transparency

Recommendations and application statuses should be understandable.

### 05. Clear Feedback

Users receive clear responses after important actions.

---

# 📊 Product Metrics

## North Star Experience Metric

### Eligibility → Recommendation Completion

Measures whether users successfully reach a useful recommendation.

---

## MVP KPIs

| Metric                      |      Target |
| --------------------------- | ----------: |
| Eligibility completion time | **< 2 min** |
| Eligibility completion rate |    **80%+** |
| Recommendation engagement   |       Track |
| Application conversion      |       Track |
| Application completion      |       Track |
| Status visibility           |    **100%** |

---

# 📈 Analytics Funnel

```text
Landing Page
     ↓
Eligibility Started
     ↓
Eligibility Completed
     ↓
Recommendations Viewed
     ↓
Card Selected
     ↓
Login Completed
     ↓
Application Started
     ↓
Application Submitted
```

### Key Events

`page_view`

`eligibility_started`

`eligibility_completed`

`recommendation_viewed`

`card_selected`

`application_started`

`application_submitted`

---

# 🧩 MVP Scope

## ✅ Included

* Eligibility questionnaire
* Rule based eligibility engine
* Card recommendations
* Google authentication
* Passwordless authentication
* User dashboard
* Application tracking
* Admin dashboard
* Application status management
* Lead management
* Educational content
* Demo deployment

## 🚫 Not Included

* Real bank integrations
* Credit bureau checks
* Real KYC
* Payment processing
* Card issuance
* Real underwriting
* Production financial decisioning
* Push notifications

---

# 🧮 Eligibility Engine

The MVP deliberately uses a **rule based decision engine**.

### Why?

| Requirement                | Rule Based Approach |
| -------------------------- | ------------------- |
| Explainability             | ✅                   |
| Fast implementation        | ✅                   |
| Easy iteration             | ✅                   |
| Deterministic results      | ✅                   |
| ML infrastructure required | ❌                   |

### Future Architecture

```text
RULE ENGINE
     ↓
Validated Product Logic
     ↓
ML Recommendation Layer
     ↓
Personalized Card Recommendations
```

The architecture allows the rules engine to evolve into a more sophisticated recommendation system.

---

# 🗄️ Data Model

Core Firestore collections:

```text
users
│
├── userId
├── profile
└── authentication

applications
│
├── applicationId
├── userId
├── cardId
├── eligibilityResult
├── status
├── createdAt
└── updatedAt

cards
│
├── cardId
├── name
├── category
├── eligibilityRules
└── benefits

leads
│
├── leadId
├── userId
├── source
└── createdAt

blogs
│
├── blogId
├── title
├── content
└── publishedAt
```

---

# 🛡️ Security & Compliance

GetYourCard is a **demo fintech product**, not a production financial service.

### Security Principles

* Firebase Authentication for identity
* Firestore security rules
* User level data access
* Admin restricted access
* No hard coded secrets
* Environment variables for configuration

### Demo Limitation

The MVP does not process real:

* Credit bureau information
* KYC documents
* Bank credentials
* Payment information
* Card issuance requests

> **This product is intended for educational and portfolio demonstration purposes only.**

---

# 🚀 Deployment

### Infrastructure

```text
GitHub / Local Development
          ↓
       Vercel
          ↓
   React Application
          ↓
       Firebase
     ┌────┴────┐
     ↓         ↓
   Auth    Firestore
```

**Hosting:** Vercel
**Database:** Firebase Firestore
**Authentication:** Firebase Authentication

---

# 🗓️ Development Timeline

| Day       | Phase       | Deliverable                 |
| --------- | ----------- | --------------------------- |
| **Day 0** | Discovery   | Problem, users and goals    |
| **Day 1** | Product     | PRD, user stories and flows |
| **Day 2** | Design      | Core UI and UX flows        |
| **Day 3** | Development | Frontend, backend and auth  |
| **Day 4** | Integration | End to end MVP              |
| **Day 5** | Launch      | Vercel demo deployment      |

---

# 🧠 Key Product Decisions

### Decision 01 — Rule Based Eligibility

**Why:**
The MVP prioritizes transparency and explainability over model complexity.

---

### Decision 02 — Firebase

**Why:**
Firebase enabled rapid implementation of authentication, database functionality and real time updates without building a custom backend.

---

### Decision 03 — Mobile First

**Why:**
The core task should be quick enough to complete from a mobile device.

---

### Decision 04 — GenAI Assisted Development

**Why:**
GenAI significantly reduced iteration time across product planning, UX and engineering while keeping human validation in the loop.

---

# 🔮 Product Roadmap

## Phase 2 — Better Discovery

* Card comparison
* Better recommendation explanations
* Advanced analytics
* User segmentation
* Improved eligibility logic

## Phase 3 — Financial Integrations

* Bank APIs
* Eligibility APIs
* KYC integrations
* Credit bureau integrations

## Phase 4 — Personalization

* ML based recommendations
* Behavioral segmentation
* Personalized financial products
* Automated application processing

## Phase 5 — Financial Marketplace

```text
Credit Cards
     +
Insurance
     +
Loans
     +
Other Financial Products
          ↓
Personalized Financial Marketplace
```

---

# 📌 Portfolio Positioning

GetYourCard demonstrates an end to end **Product + Technology + Analytics** workflow.

### Product

`Problem Definition → Personas → PRD → User Stories → Flows → MVP`

### Design

`UX → Information Architecture → Mobile First UI → Interaction Design`

### Technology

`React → Firebase → Authentication → Firestore → Vercel`

### Analytics

`Funnel → Events → KPIs → Conversion Tracking`

### AI

`GenAI → Planning → Design → Development → Iteration`

---

# 🏁 Final Outcome

GetYourCard delivers a functional fintech MVP that demonstrates the complete journey from:

> **Eligibility → Recommendation → Application → Status Tracking**

The project combines **product thinking, UX design, business logic, GenAI assisted development, technical implementation, analytics and operational workflows** into a single portfolio project.

---

## 🔗 Links

**Live Product:** https://getyourcard.vercel.app/

**Product Documentation:** GetYourCard • GenAI Assisted Fintech Eligibility Platform

---

### Built by Krusnansh Gupta

**Product Management • Product Operations • Business Analytics • GenAI • Fintech**
