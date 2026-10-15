import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | CaptionFlow" },
      { name: "description", content: "Get in touch with the team behind CaptionFlow, the free online video caption editor." },
      { property: "og:title", content: "Contact | CaptionFlow" },
      { property: "og:description", content: "Get in touch with the team behind CaptionFlow." },
    ],
  }),
  component: () => (
    <LegalPage title="Contact" intro="CaptionFlow is designed and developed by Kafeel Ahmed.">
      <p>Feedback, feature ideas, and bug reports are welcome. A dedicated contact channel will be published here soon.</p>
      <p>
        In the meantime, jump into the <Link to="/editor" className="font-semibold text-highlight underline-offset-4 hover:underline">caption editor</Link> and start creating.
      </p>
    </LegalPage>
  ),
});
