import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Toolbox Hub",
  description:
    "Report a bug, request a new tool, or send feedback about Toolbox Hub. We read every message.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Contact Toolbox Hub</h1>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          Bug reports, tool requests, corrections and partnership enquiries are all
          welcome. Every message is read by a human, and we reply to most of them within
          a few days.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Email</h2>
        <p>
          The fastest route is email:{" "}
          <a
            href="mailto:hello@toolbox-hub.io"
            className="font-medium text-foreground underline underline-offset-4"
          >
            hello@toolbox-hub.io
          </a>
        </p>

        <h2 className="text-xl font-semibold text-foreground">Reporting a bug</h2>
        <p>Include the following so the issue can be reproduced and fixed:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>The tool name and, if relevant, a link to its page.</li>
          <li>Your browser and version, plus your operating system.</li>
          <li>What you expected to happen, and what happened instead.</li>
          <li>
            A sample input, if the input can be shared without exposing private
            information.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">Requesting a tool</h2>
        <p>
          Requests are prioritised by how often people search for the missing capability
          and by how many existing tools it would connect to. A short note on the job you
          are trying to do is more useful than just a tool name, because it often reveals
          a better way to solve it.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Advertising and partnerships</h2>
        <p>
          For direct advertising enquiries, use the same address with the subject line
          prefixed &quot;Advertising&quot;. For API access, white-label licensing or
          embedding the tools in another product, prefix the subject with
          &quot;API&quot;.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Response time</h2>
        <p>
          Bug reports are usually investigated within a few working days. Tool requests
          are triaged weekly, and new tools ship in batches, so a request may take longer
          than a bug fix to appear.
        </p>
      </div>
    </div>
  );
}
