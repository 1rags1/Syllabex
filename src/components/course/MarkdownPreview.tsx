import ReactMarkdown from "react-markdown";

export function MarkdownPreview({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <p className="text-sm italic text-zinc-600">
        Nothing to preview yet — start writing in Markdown.
      </p>
    );
  }

  return (
    <div className="markdown-body text-[15px] leading-relaxed text-zinc-300">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
