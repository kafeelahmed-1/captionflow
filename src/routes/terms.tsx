import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | CaptionFlow" },
      { name: "description", content: "Terms for using the free CaptionFlow online video caption editor." },
      { property: "og:title", content: "Terms of Use | CaptionFlow" },
      { property: "og:description", content: "Terms for using the free CaptionFlow online video caption editor." },
    ],
  }),
  component: () => (
    <LegalPage title="Terms of Use" intro="Simple terms for a simple, free tool.">
      <h2>Using CaptionFlow</h2>
      <p>CaptionFlow is provided free of charge, as is, without warranties. You may use it for personal and commercial projects.</p>
      <h2>Your content</h2>
      <p>You keep all rights to your videos and captions. You are responsible for having the rights to the media you edit.</p>
      <h2>Browser limitations</h2>
      <p>Export depends on your browser's recording capabilities. Output format (MP4 or WebM) varies by browser.</p>
    </LegalPage>
  ),
});
