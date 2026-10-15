import { Captions, Type, Palette, LayoutGrid, Move } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Only available tools have a route. Add the route file, then set status + href. */
  status: "available" | "soon";
  href?: "/editor";
};

export const TOOLS: Tool[] = [
  {
    slug: "video-caption-editor",
    name: "Video Caption Editor",
    description: "Add, style, resize, and time captions — then export a captioned video in your browser.",
    icon: Captions,
    status: "available",
    href: "/editor",
  },
  {
    slug: "video-text-editor",
    name: "Video Text Editor",
    description: "Layer titles, labels, and callouts over any clip with motion-ready text.",
    icon: Type,
    status: "soon",
  },
  {
    slug: "subtitle-styling",
    name: "Subtitle Styling Tool",
    description: "Restyle existing subtitle files with brand fonts, colors, and outlines.",
    icon: Palette,
    status: "soon",
  },
  {
    slug: "caption-presets",
    name: "Caption Preset Library",
    description: "Save and reuse caption looks across every video you make.",
    icon: LayoutGrid,
    status: "soon",
  },
  {
    slug: "text-positioning",
    name: "Video Text Positioning Tool",
    description: "Snap text to safe zones for Reels, TikTok, Shorts, and widescreen.",
    icon: Move,
    status: "soon",
  },
];
