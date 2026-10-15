# Captionflowaipro

Build CaptionFlow — Premium Video Caption Editing Platform



Act as a senior frontend engineer, product designer, and UI/UX specialist. Build a complete, production-quality web application from scratch named CaptionFlow.



The product is a premium online video caption editor that lets users upload videos, add text captions, resize and position them precisely, customize typography, control caption timing, and export the finished video.



Important: Do not build a basic template, simple dashboard, or non-functional design mockup. Every major control must work correctly. The complete website must have a distinctive, premium visual identity and be architected for future expansion.



1. Technology and Architecture



- React + Vite + TypeScript.

- Static frontend-only application, deployable directly to Vercel.

- No backend, database, authentication, or paid APIs.

- Use reusable components and a modular architecture.

- Use Lucide React for icons, Framer Motion for animations, and carefully selected libraries for resizing, drag interactions, and video processing.

- Use a lightweight, reliable component system where it improves consistency.

- Avoid unnecessary dependencies, duplicated code, and excessive complexity.

- Keep the application fast, maintainable, and ready for additional tools in the future.



2. Premium Brand Design



Create a distinctive visual identity for CaptionFlow using a sophisticated creative-software aesthetic.



Use the supplied screenshot as general inspiration for the lime-green accent, clean typography, premium spacing, and editorial layout, but create a more refined and distinctive design.



Brand direction:



- Primary accent: vibrant lime green.

- Dark theme: deep charcoal, near-black surfaces, and carefully layered panels.

- Light theme: warm white, soft neutral backgrounds, subtle borders, and dark readable text.

- Modern typography, excellent visual hierarchy, refined shadows, tasteful depth, and consistent spacing.

- Beautiful buttons, custom icon treatments, polished cards, and smooth micro-interactions.



Implement a fully functional light/dark mode toggle. Persist the user's choice in localStorage and respect the system theme when no preference is saved. Both themes must be individually designed, with no unreadable text or inconsistent component colors.



3. Exceptional Landing Page



Build a premium, conversion-focused landing page with a beautiful, carefully designed layout from top to bottom.



Navbar



Include:



- CaptionFlow logo and brand name.

- Tools dropdown.

- Features and How It Works links.

- Light/dark theme toggle.

- A prominent “Start Editing Free” CTA.



Use a polished responsive mobile navigation menu.



Hero Section



Headline:



“Every Caption. Perfectly Placed.”



Supporting description:



“Add beautiful captions to your videos, customize every detail, and export your creation — all directly in your browser.”



Include:



- A premium eyebrow label above the headline.

- Elegant typography with lime-green emphasis.

- Beautiful CTA buttons: “Start Editing Free” and “See How It Works”.

- Small benefit indicators for free editing, privacy, and no account requirement.

- A visually impressive interactive product preview.



Female Creator Video Preview — Mandatory



The hero product preview must show a female content creator speaking to the camera in a vertical short-form video, similar to a professional social-media Reel or TikTok recording.



Do NOT use mountain landscapes, nature scenery, or a mountain video as the hero preview.



Use a suitable, properly licensed female creator video asset if available. If using a stock image as a fallback, make the preview clearly represent a vertical talking-head video. Prefer a real video where practical.



Display stylish sample captions over the video with a realistic caption-editing selection box, resize handles, and a visible timeline. The sample should communicate what the actual editor does.



The preview must look premium on both mobile and desktop. Optimize its loading and avoid downloading unnecessarily large media files.



Landing Page Animations



Use Framer Motion for tasteful, slow, polished reveal effects:



- Headline and subtitle enter with subtle upward motion and fading.

- Hero preview appears with a refined transition.

- Feature cards reveal progressively on scroll.

- Buttons and cards have smooth hover feedback.

- Sections transition naturally as the user scrolls.



Respect reduced-motion preferences. Animations must not block interaction, slow down the editor, or create unnecessary rendering overhead.



4. Premium Cards and Tools Section



Create a visually rich Tools section with reusable, beautifully designed cards.



Each card should have:



- A clear tool icon.

- Tool name and concise description.

- A distinct visual preview or illustrative treatment where useful.

- Refined borders, balanced spacing, elegant typography, and subtle hover animations.

- A clear action indicating whether the tool is available.



The initial tool should be Video Caption Editor.



Prepare the architecture for future tools such as:



- Video Text Editor.

- Subtitle Styling Tool.

- Caption Preset Library.

- Video Text Positioning Tool.



These additional tools must be clearly marked as coming soon until implemented. Do not create fake working tools or broken navigation. The Tools dropdown, tool cards, and routes must behave correctly.



5. Professional Editing Workspace



Build a dedicated editor with a premium creative-software interface.



Include:



- A professional top toolbar.

- Video upload and file information.

- Large video preview.

- Caption layers panel.

- Caption styling properties panel.

- Timeline with a synchronized playhead.

- Playback controls, time indicators, and seek controls.

- Add Caption, Duplicate, Delete, Undo/Redo where practical, and Export actions.



Desktop layout should use a well-balanced multi-panel workspace. Mobile should use a stacked layout or accessible collapsible panels.



Do not overload the screen with tiny controls. Use clear labels, helpful tooltips, and consistent iconography.



6. Upload and Video Handling



- Support drag-and-drop and file-picker uploads.

- Support browser-compatible formats such as MP4 and WebM.

- Detect the actual duration, dimensions, and aspect ratio of the uploaded video.

- Display useful upload errors for unsupported or corrupted files.

- Revoke obsolete object URLs and release temporary resources when changing videos.

- Do not depend on a backend to upload or process videos.



After uploading, display the actual user-uploaded video in the editor, not a permanently hardcoded demo video.



7. Caption Editing and Typography



Allow users to add multiple independently editable captions.



Each caption must support:



- Manual text entry and editing.

- Font family, font size, weight, italic, underline, and alignment.

- Text color, background color, background opacity, outline, and shadow.

- Letter spacing and line height where practical.

- Caption start time, end time, and duration.

- Preset styles for social-media captions, bold subtitles, minimal text, and cinematic titles.



Include a broad, curated collection of font styles using reliable, appropriately licensed fonts. Show a visual preview in the font selector and load fonts efficiently.



Changes must appear immediately in the video preview.



8. Critical Requirement: Proper Caption Resizing



Caption resizing must work accurately and reliably. Do not implement decorative handles that do nothing.



Use a reliable drag/resize interaction library or implement a robust pointer-based interaction system with proper coordinate calculations.



Required behaviour:



- Selecting a caption displays visible corner and edge resize handles.

- Dragging a corner or edge resizes the selected caption box in real time.

- Moving a caption changes its position without accidentally resizing it.

- Clicking a resize handle must not trigger dragging of the parent caption.

- Resizing must not unexpectedly change the caption's position.

- Maintain sensible minimum and maximum dimensions.

- Keep captions within the video frame, with predictable boundary behaviour.

- Allow font size to be adjusted independently from the text-box dimensions.

- Handle text wrapping and multiline captions correctly.

- Update caption properties immediately.

- Prevent unwanted selection, pointer-event conflicts, jumping, flickering, and clipping.

- Correctly convert screen coordinates to video-preview coordinates.

- Keep caption positioning and sizing accurate when the editor panel, browser window, or video aspect ratio changes.

- Support mouse, touch, and pointer interactions on mobile.

- Make the selected caption and its handles visually clear without appearing in the exported video.



Use a single, consistent coordinate system based on the video's actual aspect ratio. The preview may scale visually, but the underlying caption positions and dimensions must remain accurate.



Do not use conflicting nested draggable handlers. Ensure movement, resizing, text editing, and selection work independently.



9. Accurate Caption Timeline



The uploaded video's actual duration is the source of truth.



- Every caption has editable start and end times.

- Provide a “Show for Entire Video” option.

- A 20-second video must display a full-video caption from 0 to 20 seconds.

- A 30-second video must display it from 0 to 30 seconds.

- Never use arbitrary fixed-duration timers to hide captions.

- Synchronize caption visibility with video.currentTime.

- Seeking, pausing, replaying, and uploading a different video must work correctly.

- Support multiple independent caption timings.

- Validate timing against the actual duration.

- Prevent blinking, disappearing captions, and stale caption state.



10. Genuine and Efficient Video Export



Export must produce a real video with captions rendered into its frames.



- Use a suitable, efficient browser-based rendering and encoding approach.

- Explore browser-native canvas rendering and MediaRecorder where appropriate, or another reliable client-side solution if required.

- Preserve aspect ratio, timing, and resolution wherever possible.

- Keep caption styles and positions consistent with the preview.

- Show genuine export progress and meaningful error messages.

- Avoid unnecessary transcoding and repeated processing.

- Optimize memory use and release resources after export.

- Handle unsupported formats and browser limitations honestly.

- Never show a fake success state or download the unmodified original as if captions were embedded.



Prioritize efficient exports for short-form videos without compromising caption accuracy. Do not add heavyweight libraries unless genuinely necessary. Explain limitations clearly if a browser cannot support a particular export format.



11. Premium Footer



Design a polished, responsive, multi-column footer featuring:



- CaptionFlow logo and brand description.

- Product and Tools navigation.

- Features and Resources.

- Privacy Policy, Terms, and Contact links.

- Consistent spacing and elegant typography.

- A professional copyright line.

- Developed by Kafeel Ahmed.



Do not create fake social profiles or broken links. Keep future tool navigation easy to extend.



12. SEO and Performance



- SEO title: “Free Online Video Caption Editor | CaptionFlow”

- Meta description: “Add, resize, style, and synchronize video captions online for free. Export captioned videos directly in your browser.”

- Semantic HTML and proper heading hierarchy.

- Open Graph metadata.

- Accessible controls and descriptive image alt text.

- Optimized assets, lazy-loaded media where appropriate, and efficient font loading.

- Fast landing-page rendering and minimal unnecessary JavaScript.

- Natural keyword targeting for online video caption editor, add text to video, video caption maker, and video text editor.

- Use a configurable canonical URL placeholder until the production domain is available.



Keep animation effects lightweight and prevent layout shifts.



13. Quality Assurance and Final Requirements



Before considering the app complete, verify:



- Light/dark mode works across the entire site.

- Landing-page navigation and Tools links work.

- Female creator preview appears correctly.

- Uploaded videos play and their duration is detected accurately.

- Captions can be added, edited, moved, and resized reliably.

- Resize handles work independently of drag-to-move.

- Captions remain visible for their correct durations.

- Multiple captions work independently.

- Export generates a genuine captioned video.

- Mobile, tablet, and desktop layouts remain usable.

- No broken buttons, fake controls, runtime errors, or unnecessary console warnings.

- The application builds successfully for static Vercel deployment.



Implementation priority: Correct functionality first, premium UI second, and unnecessary complexity last. Build a cohesive, scalable, high-quality product using efficient code and carefully chosen dependencies. Do not sacrifice editing accuracy or export performance for decorative effects. In edit section video must preview during edit and caption also preview

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://captionflowaipro.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/79032be2-1aac-4178-b8dd-8e07bcf0f1ec).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
