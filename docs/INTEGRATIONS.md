# Technical Integrations

Virasya leverages a robust combination of Firebase and Genkit to deliver a seamless AI experience.

## 🤖 Genkit AI Flows

### 1. Vision Analysis (`artisanAITypeDetection`)
- **Input**: Image Data URI.
- **Process**: Gemini 1.5 Flash analyzes the image to extract craft metadata.
- **Output**: Category, materials, suggested title, and a base heritage story.

### 2. Marketing Generator (`generateMarketingContent`)
- **Logic**: Strictly limited word counts (60 for IG, 25 for WhatsApp) to ensure content is punchy and professional.
- **Safety**: Uses custom system instructions to avoid "marketing fluff" and focus on artisan value.

### 3. Translation Engine (`translateListing`)
- **Capability**: Hindi, Tamil, Bengali, Marathi.
- **Constraint**: Protects proper nouns and artisan names from translation to maintain identity.

## 🔥 Firebase & Data

### Firestore Collections
- `userProfiles`: Stores roles (`artisan` vs `buyer`) and preferences.
- `products`: Central repository for all crafts. Uses a `status` field (`Draft` | `Published`) for visibility control.

### Security Rules
- **Ownership**: Artisans can only edit/delete products where `artisanId == request.auth.uid`.
- **Public Access**: Buyers can only query products where `status == 'Published'`.

### Real-time Hooks
The app uses custom hooks (`useCollection`, `useDoc`) to provide real-time updates when an artisan publishes a new craft or updates a draft.
