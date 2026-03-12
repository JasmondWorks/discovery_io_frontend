DISCOVER.IO — FRONTEND ARCHITECT MASTER PROMPT
Role: Senior Frontend Engineer & UI/UX Specialist.

Context: The Discover.IO backend has been fully upgraded with a robust data layer and a personalized recommendation engine. We have seeded 150+ tools, 20 workflows, and 15+ solutions. The API is documented in the attached swagger.json. Your goal is to integrate these resources into the React/Next.js frontend.

Key Features to Implement/Enhance:

1. The Personalized Tools Catalog (PRD Feature 3)
Endpoint: GET /api/v1/tools/for-me
Requirement: This endpoint returns a catalog object where tools are grouped by category (e.g., "AI Writing", "AI Design").
UI Logic:
If onboardingCompleted is false, show a "Recommended for You" section featuring global fallback tools with a CTA to "Complete Onboarding for Custom Results."
If true, render the grouped catalog. Use a tabbed interface or scrollable horizontal sections for each category.
Display tool cards with pricing badges (Free, Freemium, etc.) and persona tags.
2. The 2-Step "Smart Chat" Flow (PRD Feature 5 & 6)
Step 1 (Clarification): When a user sends a query to POST /api/v1/chats, the backend returns a structured clarification (Persona, Task, Success Criteria). You MUST render this as a prompt for the user to confirm (e.g., "Yes, that's exactly what I need" or "Actually, I'm a developer, not a designer").
Step 2 (Recommendation): After confirmation, POST the response back to the session. The backend will return a rich Markdown response containing:
Tools: Up to 5 ranked matches with scores (Usefulness, Relevance, Reliability).
Workflows: Step-by-step guides using multiple tools.
Solutions: Expert fixes for specific technical problems.
UI Logic: Use a Markdown renderer that handles headers (###), bolding, and lists. Render the scores as progress bars or circular badges.
3. Search & Discovery Filters
Endpoint: GET /api/v1/tools, GET /api/v1/workflows, GET /api/v1/solutions
Requirement: Enable searching by category and tags (persona slugs).
UI Logic: Create a "Browse by Role" sidebar or chip-group utilizing the canonical persona tags: graphic_designer, content_writer, software_engineer, marketer, product_manager, etc.
4. Updated Onboarding Experience
Source: Refer to 

src/scripts/data/onboarding_questions.json
.
Requirement: Ensure the onboarding multi-step form accurately maps answers to the professionalProfile schema in the PUT /api/v1/users/profile endpoint.
Validation: Frontend must enforce that all profile fields are populated before setting onboardingCompleted: true.
Technical Constraints:

Type Safety: Use the definitions in swagger.json to create TypeScript interfaces for 

Tool
, 

Workflow
, 

Solution
, and ProfessionalProfile.
State Management: Use React Query (or SWR) for fetching catalog data to ensure caching and smooth loading states.
Aesthetics: The design should feel premium—use glassmorphism, subtle micro-animations for card hovers, and a sleek dark/light mode toggle.
Instruction: Begin by analyzing the swagger.json and my existing apiService.ts. Start by updating the Tool Catalog page.