# Site content backend

The content module stores editable business details, page copy, links, metadata, ordered sections, and a shared service catalog in PostgreSQL. It exposes private drafts to existing Clerk admins and published content to public readers. The frontend renders every public page from this content and edits it in `/admin`; see [Frontend](#frontend).

## Deployment

The backend's Vercel production build compiles the application and then applies pending migrations using the project's production database environment. A migration failure fails the deployment. Preview and local builds skip this step, and runtime startup keeps `migrationsRun: false`.

For deployments outside Vercel, enter the Nix dev shell and run the existing backend migration command against the intended deployment database before releasing the backend:

```bash
nix develop path:.
pnpm --filter backend migration:run
```

Migration `1791763200000-CreateSiteContent` creates `content_documents` and `content_revisions`, then seeds the current service prices and initial content for Home, About, Pricing, Contact, Booking, and Gallery. Seeds are a fixed migration snapshot in `backend/src/content/content-seed.v1.ts`. Subsequent starts never reset edits. The migration does not change gallery items or the existing booking deposit. Reverting this migration deletes content and revision records; use it only when those records can be discarded.

Existing `CLERK_ADMIN_USER_IDS`, Clerk token verification, authorized-party configuration, and rate limiting also apply to content administration. A Clerk account needs to be on the allowlist to edit content. Admin calls require `Authorization: Bearer <session-token>`. The narrow bearer-only CSRF exemption supports the existing Next.js admin proxy pattern, including when CSRF protection is enabled. Cookie identity alone is insufficient.

Content admin routes inherit the global limit of 60 requests per minute per client and route. Quotes have a separate 30-request limit. PostgreSQL stores the counters across API instances.

## Public reads

Every route starts with `/api`. Responses use `Cache-Control: no-store`; the frontend may deliberately cache server reads and invalidate them on publication.

- `GET /content` returns `{ documents: [...] }` with all published documents in one database snapshot.
- `GET /content/site` returns the shared business and site content document.
- `GET /content/catalog` returns the published service catalog.
- `GET /content/pages` returns `{ pages: [...] }` containing published pages.
- `GET /content/pages/:slug` returns one published page. `home` represents `/`; other slugs represent `/<slug>`. Missing or unpublished pages return 404.

A public document contains only `key`, `kind`, `revisionId`, `publishedAt`, and `value`. It never exposes drafts, editor identity, or private history. Published page sections retain `enabled` so renderers can skip hidden sections while preserving their position and data.

## Admin workflow

Admin routes start with `/api/content/admin` and require the verified admin bearer token. Read responses use `Cache-Control: no-store`. A document includes `key`, `kind`, `draft`, `version`, `published`, `publishedRevisionId`, `publishedAt`, `updatedByUserId`, and `updatedAt`.

- `GET /documents` lists document summaries and `hasUnpublishedChanges`.
- `GET /documents/:key` loads the complete document, including its private draft for editing or preview.
- `PUT /documents/:key/draft` takes `{ expectedVersion, value }` and replaces the complete draft. It returns the updated document. Omitted fields are not merged.
- `POST /documents/:key/publish` takes `{ expectedVersion }`, validates and copies the draft into published content, and records a publication snapshot. It returns `{ document, affectedPaths }`.
- `POST /documents/:key/reorder` takes `{ expectedVersion, ids }`. The array must include every existing page section ID exactly once. It changes only the draft order and returns the updated document.
- `GET /documents/:key/revisions?page=1&limit=20` returns `{ revisions, total, page, limit }`, newest publication version first. The limit is at most 100. List items contain revision metadata, without the full snapshot.
- `GET /documents/:key/revisions/:id` returns a revision and its full `value`.
- `POST /documents/:key/restore` takes `{ expectedVersion, revisionId }` and copies that document's revision into its draft. It returns the updated document. Publication remains a separate action.
- `POST /pages` takes `{ slug, value }` and creates an unpublished page. It returns the document with status 201. This supports future page creation; the first frontend iteration can omit its UI.
- `POST /documents/:key/unpublish` takes `{ expectedVersion }`, removes a page from public reads, and preserves its draft and publication history. It returns `{ document, affectedPaths }`. Site and catalog records cannot be unpublished.

Keys are `site`, `catalog`, and `page:<slug>`. Encode keys when constructing URLs. Slugs and section/catalog IDs use lowercase letters, digits, and hyphens, starting with a letter. Page slugs are at most 80 characters. Reserved routes such as `admin`, `api`, and `sign-in` are rejected. Slugs are stable; creation does not install a Next.js route or automatically add navigation links.

Every draft save, reorder, restore, publish, or unpublish increments `version`. Send the last version returned by the backend as `expectedVersion`. The backend locks each document within a transaction and returns 409 with `currentVersion` for an outdated edit. Reload and let the admin reconcile changes rather than silently overwriting another editor. New-page collisions also return 409.

History stores publication and unpublication snapshots with the editor and time. Draft saves record the latest editor and time on the document; they do not each create a history entry. Restoring never modifies the historical snapshot. There is no history deletion endpoint.

The frontend's publishing handler should use `affectedPaths` to invalidate public page caches and refresh its own editor state. Shared site and catalog edits affect all currently published pages. Include the shared layout for shared content changes. Refresh the sitemap after page publication or unpublication as well, because page metadata such as `noIndex` and publication status affect membership. The backend does not call Next.js cache functions or expose draft previews publicly. Preview can reuse the page renderer with the authenticated draft document.

## Content shapes

The DTOs in `backend/src/content/dto/content.dto.ts` define the exact required fields and bounds. All documents use `schemaVersion: 1`. Unknown properties at the structured DTO levels are rejected. `site.copy` and page section `fields` intentionally accept bounded plain JSON so additional copy and section variations can be added without changing the table schema.

Site content contains:

- `business`: name, E.164 phone, phone display text, email, service area, hours, and location note.
- `navigation`, `footerLinks`, `socialLinks`: ordered `{ label, href }` lists.
- `bookingLink`: a shared `{ label, href }` action.
- `metadata`: title, description, optional social title/description/image URL, and optional `noIndex`.
- `copy`: shared labels, messages, and other site text. Additional labels such as form and accessibility text can be stored here as the frontend replaces remaining constants.

Page content contains `title`, `metadata`, and an ordered `sections` array. Each section has a stable `id`, a `type`, `enabled`, and `fields`. Supported types are `hero`, `rich-text`, `services`, `steps`, `reviews`, `social`, `cta`, `faq`, `gallery`, `contact`, `booking`, and `owner`. New section types need backend validation and a frontend renderer. Sections can be added, removed, or hidden through a full draft replacement. Order is meaningful and IDs should survive text edits and reorders.

For example:

```json
{
  "schemaVersion": 1,
  "title": "About us",
  "metadata": { "title": "About us", "description": "Meet your detailer." },
  "sections": [
    {
      "id": "introduction",
      "type": "rich-text",
      "enabled": true,
      "fields": {
        "heading": "Our approach",
        "paragraphs": ["We detail your car indoors."],
        "link": { "label": "See prices", "href": "/pricing" }
      }
    }
  ]
}
```

The initial page records show useful field conventions for current sections. Render text as text and use known components for sections. The backend does not interpret HTML, JavaScript, CSS, React components, or templates. It bounds serialized JSON documents to 80,000 UTF-8 bytes, generic text to 10,000 Unicode code points, and generic arrays/objects to 100 entries. The nesting limit is 10 levels measured from each section's `fields` or `site.copy` root at depth zero; document wrappers do not consume that allowance. Structured DTO fields can have tighter text limits. Page sections have a limit of 50 unique IDs. Keys named `href`, `url`, `src`, or ending with those names receive URL validation. Use these conventions for links and media sources. Supported destinations are site-relative paths, anchors, HTTPS URLs without credentials, `mailto:`, and E.164 `tel:` links. Executable schemes, protocol-relative URLs, backslashes, and whitespace in destinations are rejected.

Copy mentioning derived facts should use shared data. Seeded pricing text uses a literal `{surchargeRange}` token and booking copy includes `{depositAmount}`. The frontend should substitute those specific values from the current catalog and booking settings, rather than evaluating arbitrary templates. Coating's included correction value should derive from its referenced correction service. FAQ structured data and page metadata should use the same published text as the page.

## Service catalog and quotes

The catalog has `currency: "USD"`, `calUsername`, `categories`, `vehicleSizes`, `addons`, and `ceramicServices`. Money uses integer cents throughout. Categories own packages and a `calEventSlug`. Packages include descriptions, feature lists, highlight/best-value flags, `enabled`, `ceramicEligible`, and a duration range in minutes. Vehicle sizes have `surchargeCents`. Add-ons and ceramic services have permanent IDs independent of their editable names. Prefer disabling an item to deleting or changing its ID when existing links may refer to it.

Ceramic services declare `kind: "coating" | "correction"`. A coating can reference an `includedCorrectionId`; the referenced correction must exist and be enabled when the coating is enabled. The quote charges the difference when upgrading that included correction. Coating duration includes the referenced correction. Selecting that exact correction adds no time; selecting a different correction adds its listed duration as additional work. A coating without an included correction adds the selected correction's full price and duration. Duration ranges must be ordered, IDs unique within their lists, and the catalog must contain an enabled package and vehicle size. Disabled offerings stay visible in the catalog payload for administrative consistency; public renderers must filter them and the quote endpoint rejects them.

`POST /api/content/quote` accepts selections, never customer-supplied amounts:

```json
{
  "categoryId": "combo",
  "packageId": "platinum",
  "vehicleSizeId": "large-suv",
  "addonIds": ["pet-hair-removal"],
  "coatingId": "graphene-coating",
  "correctionId": "paint-correction-2"
}
```

This selection currently totals `142500` cents, with a duration of 480–780 minutes. The response includes `currency`, `catalogRevisionId`, `selection`, descriptive `lineItems` with `amountCents`, `totalCents`, `duration`, and `calLink`. The quote calculates from published content only. An optional `catalogRevisionId` in the request makes stale prices return 409 with the current catalog revision. Missing, disabled, duplicate, or ineligible selections return 400. The public endpoint has a 30-per-minute rate limit and is CSRF-exempt because it only reads public content, never uses cookie identity, and persists no state.

Quotes are estimates, not reservations or payments. A future confirmed-booking integration must persist the returned line items, total, and catalog revision as the agreed snapshot and verify payment separately. Publication snapshots preserve old catalog values for that integration, but the content module does not attach quotes to the existing placeholder booking service. It also does not change Cal.com payment settings, create event types, or issue Stripe charges/invoices. The existing `/api/settings/booking` deposit remains authoritative and separate from content drafts. Frontend labels that depend on it should read those settings.

## Frontend

Public routes (`/`, `/pricing`, `/booking`, `/gallery`, `/about`, `/contact`) render through `frontend/src/components/content/content-page.tsx`, which maps each enabled section to a renderer in `components/content/sections.tsx`. Adding a page later needs only its content and a route that calls `contentRoute(slug)`. A new section type needs a renderer there and an editor schema in `components/admin/content/section-schemas.tsx`.

- `lib/server/content-api.ts` reads `GET /content` once per render, cached under the `site-content` tag for up to five minutes. If the backend is unreachable, pages render `lib/content/fallback-content.ts`, a copy of the seed that a unit test keeps identical to it.
- The layout, navigation, footer, metadata, structured data, sitemap, and 404 links read the published `site` document. Client components read it through `SiteContentProvider`.
- Prices, the `{surchargeRange}` token, home “from” prices, ceramic included-correction values, and the booking wizard all come from `lib/content/catalog.ts`. That file mirrors the backend quote; `content.test.mjs` compares the actual implementations over catalog selections and mutations, including disabled items and correction durations. Before showing the calendar, the wizard calls `POST /content/quote` from the browser with the page's `catalogRevisionId`, so each visitor has their own rate limit. A 409 asks the visitor to reload prices. `{depositAmount}` comes from the cached booking settings; saving the deposit in admin expires them.
- The admin has tabs for Pages, Business & site, Services & prices, Gallery, and Booking. Edits stay in the browser until **Save draft**, **Save & preview**, or **Publish**. Each write sends the last version seen. A 409 shows a choice to load the latest version or deliberately save over it. **Publish** saves pending edits first. `/api/admin/content/[...path]` then expires the `site-content` tag, the returned `affectedPaths`, and the sitemap. Site or catalog changes also refresh the layout. The handler reports whether that refresh succeeded.
- **Preview** opens `/admin/preview/<slug>`, which renders the saved drafts of `site`, `catalog`, and that page with the live renderer. With unsaved edits the action reads **Save & preview** and saves this document first; a save conflict must be resolved before opening it. Site-relative navigation and section/package links retain query strings and anchors within preview. It is admin-only and uncached. History lists publications and restores one into the draft.
- Unpublishing and page creation have no UI yet; the current routes are fixed.

## Verification

Backend unit tests cover seeds and validation boundaries, including Unicode text, JSON depth, byte size, object/list lengths, section counts, and duplicate section IDs. `backend/test/content.postgres-spec.ts` covers the HTTP publishing workflow against real PostgreSQL with actual middleware, DTO validation, CSRF, admin guards, concurrency, revision isolation, quote behavior, public 404 responses, unpublished-change summaries, and conflict versions. The test module stubs the Clerk authentication method and logging; it does not exercise Clerk's token verification implementation or boot the full application module. It uses production PostgreSQL throttler storage and the application's 60-request global default, clears counters in its private schema before each test, and verifies exactly 30 successful quotes or 60 successful admin reads before the next request returns 429. The existing PostgreSQL suite also checks migration rollback/replay.

Frontend tests compare the actual quote implementations, check client validation bounds, and render preview links and edited visitor copy. `frontend/test/admin-content.test.mjs` runs the actual editor components and document hook in Chromium, including decimal typing, row reordering, save conflicts, publication, preview saving, and history pagination. Its HTTP responses and feedback UI are mocked. The Playwright suite checks public rendering with bundled fallback content on desktop and mobile. These checks cover the component and HTTP workflows separately; a full authenticated frontend-to-backend admin session remains outside this coverage.

Run the checks inside the Nix dev shell, which supplies Chromium on Linux. PostgreSQL integration tests require `TEST_DATABASE_URL` pointing to a disposable local test database. The helper creates a separate random schema per suite and removes only those schemas when finished.
