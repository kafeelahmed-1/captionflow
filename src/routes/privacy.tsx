import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | CaptionFlow" },
      { name: "description", content: "How CaptionFlow handles your data: videos are processed locally in your browser and never uploaded." },
      { property: "og:title", content: "Privacy Policy | CaptionFlow" },
      { property: "og:description", content: "Videos are processed locally in your browser and never uploaded." },
    ],
  }),
  component: () => (
    <LegalPage title="Privacy Policy" intro="CaptionFlow is built so your videos stay yours.">
      <h2>Your videos stay on your device</h2>
      <p>Videos you open in the editor are read directly by your browser. They are never uploaded to a server, and exports are generated locally.</p>
      <h2>What we store</h2>
      <p>We save only your light/dark theme preference in your browser's local storage. There are no accounts and no caption data is sent anywhere.</p>
      <h2>Fonts</h2>
      <p>Typefaces are loaded from Google Fonts, which may receive standard request information such as your IP address.</p>
    </LegalPage>
  ),
});
