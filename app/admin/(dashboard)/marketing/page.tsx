"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { fetchJSON, postJSON } from "@/lib/fetcher";
import { useLocations } from "@/lib/hooks";
import type { Client } from "@/lib/crm";

type AudienceChoice = "all" | "lapsed30" | `location:${string}`;

interface SendResult {
  audienceSize: number;
  sent: number;
  skipped: number;
  failed: number;
}

export default function AdminMarketingPage() {
  const { data: clientsData } = useSWR("/api/admin/clients", fetchJSON<{ clients: Client[] }>);
  const { locations } = useLocations();
  const clients = clientsData?.clients ?? [];

  const [channel, setChannel] = useState<"email" | "sms">("sms");
  const [audience, setAudience] = useState<AudienceChoice>("all");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult>();
  const [error, setError] = useState<string>();

  const [now] = useState(() => Date.now());

  const previewCount = clients.filter((c) => {
    if (audience === "all") return true;
    if (audience === "lapsed30") {
      return (now - new Date(c.lastVisit).getTime()) / 86_400_000 >= 30;
    }
    const locationId = Number(audience.replace("location:", ""));
    return c.locationIds.includes(locationId);
  }).length;

  async function send() {
    setSending(true);
    setError(undefined);
    setResult(undefined);
    try {
      const audiencePayload = audience.startsWith("location:")
        ? { locationId: Number(audience.replace("location:", "")) }
        : audience;
      const res = await postJSON<SendResult>("/api/admin/marketing/send", {
        channel,
        audience: audiencePayload,
        subject,
        message,
      });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Marketing</h1>
      <p className="mt-1 text-sm text-[var(--color-ink)]/60">
        Send a message to clients from booking history. SMS uses the same free Textbelt tier as
        confirmations (daily limit applies); email needs SMTP configured.
      </p>

      <div className="mt-6 max-w-lg space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50">
            Channel
          </label>
          <div className="mt-1 flex gap-2">
            {(["sms", "email"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={
                  "rounded-full border px-4 py-2 text-xs font-mono uppercase tracking-wide " +
                  (channel === c
                    ? "border-[var(--color-clay)] bg-[var(--color-clay)] text-[var(--color-bone)]"
                    : "border-[var(--color-line)] text-[var(--color-ink)]")
                }
              >
                {c === "sms" ? "SMS" : "Email"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50">
            Audience
          </label>
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as AudienceChoice)}
            className="mt-1 block w-full rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none"
          >
            <option value="all">All clients</option>
            <option value="lapsed30">Haven&apos;t visited in 30+ days</option>
            {locations.length > 1 &&
              locations.map((l) => (
                <option key={l.id} value={`location:${l.id}`}>
                  Clients of {l.name}
                </option>
              ))}
          </select>
          <p className="mt-1 text-xs text-[var(--color-ink)]/50">{previewCount} recipient(s)</p>
        </div>

        {channel === "email" && (
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50">
              Subject
            </label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="mt-1 block w-full rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none"
          />
        </div>

        <Button onClick={send} disabled={sending || !message.trim()}>
          {sending ? "Sending…" : `Send to ${previewCount} client(s)`}
        </Button>

        {error && <p className="text-sm text-[var(--color-danger-dim)]">{error}</p>}
        {result && (
          <p className="text-sm text-[var(--color-sage)]">
            Sent {result.sent} of {result.audienceSize}
            {result.skipped > 0 && ` (${result.skipped} skipped — no email on file, or SMS limit reached)`}
            {result.failed > 0 && ` (${result.failed} failed)`}
          </p>
        )}
      </div>
    </div>
  );
}
