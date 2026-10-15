// Set VITE_SITE_URL to the production domain once available.
export const SITE_URL: string =
  (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://captionflow.example.com";

export const SEO = {
  title: "Free Online Video Caption Editor | CaptionFlow",
  description:
    "Add, resize, style, and synchronize video captions online for free. Export captioned videos directly in your browser.",
};
