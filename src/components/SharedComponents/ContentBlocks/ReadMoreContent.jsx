import { richTextToHtml } from "@/utils/richText";
import ReadMoreContentClient from "./ReadMoreContentClient";

// Server wrapper: converts the expanded rich text to HTML here; the "use client"
// part only handles the read more / read less toggle.
export default function ReadMoreContent({ data }) {
  return (
    <ReadMoreContentClient
      data={data}
      expandedHtml={richTextToHtml(data?.expandedContent)}
    />
  );
}
