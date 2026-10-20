import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use - Toolbox Hub",
  description:
    "The terms that govern your use of Toolbox Hub and its free online tools.",
  alternates: { canonical: "/terms/" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: 20 October 2026
      </p>

      <div className="mt-6 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>
          These terms govern your use of Toolbox Hub. By using the Site you agree to them.
          If you do not agree, please do not use the Site.
        </p>

        <h2 className="text-xl font-semibold text-foreground">1. The service</h2>
        <p>
          Toolbox Hub provides free browser-based utilities. We may add, change, or remove
          tools and features at any time. A tool may be changed or withdrawn if it
          becomes unmaintainable, insecure, or subject to a third-party limitation.
        </p>

        <h2 className="text-xl font-semibold text-foreground">2. Acceptable use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use the Site for any unlawful purpose or in breach of any regulation.</li>
          <li>
            Attempt to disrupt the Site, probe it for vulnerabilities without permission,
            or circumvent rate limits and access controls.
          </li>
          <li>
            Use the tools to break applicable law or the terms of a third-party service,
            including copyright and platform rules.
          </li>
          <li>
            Redistribute, resell, or provide the tools as a service without written
            permission.
          </li>
          <li>
            Scrape the Site for the purpose of republishing it substantially unchanged.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">3. Your content</h2>
        <p>
          You keep all rights to the text and files you process with our tools. Since
          processing happens on your device, we never receive, claim, or license any
          rights to that content.
        </p>

        <h2 className="text-xl font-semibold text-foreground">4. No warranty</h2>
        <p>
          The Site is provided &quot;as is&quot;, without warranties of any kind, whether
          express or implied, including merchantability, fitness for a particular
          purpose, and non-infringement. We do not warrant that the Site will be
          uninterrupted, error-free, or that any result will meet your needs. Always
          verify the output of any tool before relying on it, especially for financial,
          legal, medical, or safety-critical decisions.
        </p>

        <h2 className="text-xl font-semibold text-foreground">5. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, we are not liable for any indirect,
          incidental, special, consequential, or punitive damages, nor for any loss of
          data, profits, or goodwill, arising from your use of the Site. Where liability
          cannot be excluded, our total aggregate liability is limited to the greater of
          the amount you paid us, which is zero, or the minimum amount required by
          applicable law.
        </p>

        <h2 className="text-xl font-semibold text-foreground">6. Advertising</h2>
        <p>
          The Site displays third-party advertising. We do not endorse advertised
          products or services and are not responsible for the content of third-party
          sites, their privacy practices, or the goods and services they offer.
        </p>

        <h2 className="text-xl font-semibold text-foreground">7. Intellectual property</h2>
        <p>
          The Site&rsquo;s name, design, code, and written content are owned by Toolbox Hub
          and protected by applicable intellectual property law. You may link to the Site
          and quote short excerpts with attribution. Bulk copying of content for
          republication requires written permission.
        </p>

        <h2 className="text-xl font-semibold text-foreground">8. Third-party tools</h2>
        <p>
          Some tools reference or recommend third-party services. Those services are
          governed by their own terms and privacy policies, and we are not responsible
          for them.
        </p>

        <h2 className="text-xl font-semibold text-foreground">9. Termination</h2>
        <p>
          We may suspend or block access to anyone who breaches these terms. You may stop
          using the Site at any time.
        </p>

        <h2 className="text-xl font-semibold text-foreground">10. Changes and governing law</h2>
        <p>
          We may revise these terms at any time, and the version published on this page
          is the one that applies. These terms are governed by the laws of the
          jurisdiction in which the Site operator is established, without regard to
          conflict-of-law rules.
        </p>

        <h2 className="text-xl font-semibold text-foreground">11. Contact</h2>
        <p>
          Questions about these terms can be sent to{" "}
          <a
            href="mailto:hello@toolbox-hub.io"
            className="font-medium text-foreground underline underline-offset-4"
          >
            hello@toolbox-hub.io
          </a>
          .
        </p>
      </div>
    </div>
  );
}
