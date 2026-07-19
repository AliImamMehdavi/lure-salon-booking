"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Avatar } from "@/components/ui/Avatar";
import { fetchJSON, patchJSON, postJSON } from "@/lib/fetcher";
import { useLocations } from "@/lib/hooks";
import { useToast } from "@/components/ui/Toast";

interface StaffMember {
  id: number;
  locationId: number;
  name: string;
  title: string;
  availableOnline: boolean;
  workingHours: { dayOfWeek: number; start: string; end: string }[];
  daysOff: string[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminStaffPage() {
  const { data, isLoading, mutate } = useSWR("/api/admin/staff", fetchJSON<{ staff: StaffMember[] }>);
  const { locations } = useLocations();
  const staff = data?.staff ?? [];
  const locationName = (id: number) => locations.find((l) => l.id === id)?.name ?? "—";
  const toast = useToast();

  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newLocationId, setNewLocationId] = useState("");

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || locations.length === 0) return;
    try {
      await postJSON("/api/admin/staff", {
        name: newName,
        title: newTitle,
        locationId: Number(newLocationId || locations[0].id),
        availableOnline: true,
        daysOff: [],
        workingHours: Array.from({ length: 6 }, (_, i) => ({
          dayOfWeek: i + 1,
          start: "09:00",
          end: "18:00",
        })),
      });
      setNewName("");
      setNewTitle("");
      mutate();
      toast(`${newName} added to the team`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Couldn't add staff member", "error");
    }
  }

  async function toggleAvailable(member: StaffMember) {
    await patchJSON(`/api/admin/staff/${member.id}`, { availableOnline: !member.availableOnline });
    mutate();
  }

  async function changeLocation(member: StaffMember, locationId: string) {
    await patchJSON(`/api/admin/staff/${member.id}`, { locationId: Number(locationId) });
    mutate();
  }

  async function toggleDayOff(member: StaffMember, day: number) {
    const daysWorked = new Set(member.workingHours.map((w) => w.dayOfWeek));
    const working = daysWorked.has(day);
    const workingHours = working
      ? member.workingHours.filter((w) => w.dayOfWeek !== day)
      : [...member.workingHours, { dayOfWeek: day, start: "09:00", end: "18:00" }];
    await patchJSON(`/api/admin/staff/${member.id}`, { workingHours });
    mutate();
  }

  async function removeStaff(id: number) {
    await fetchJSON(`/api/admin/staff/${id}`, { method: "DELETE" });
    mutate();
    toast("Staff member removed");
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-ink)]">Staff</h1>

      <form onSubmit={addStaff} className="mt-6 flex flex-wrap items-end gap-3">
        <Field label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Field label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
        {locations.length > 1 && (
          <div>
            <label className="text-xs font-mono uppercase tracking-wide text-[var(--color-ink)]/50">
              Location
            </label>
            <select
              value={newLocationId}
              onChange={(e) => setNewLocationId(e.target.value)}
              className="mt-1 block rounded-sm border border-[var(--color-line)] bg-white/40 px-3 py-2 text-sm focus:border-[var(--color-clay)] focus:outline-none"
            >
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <Button type="submit">Add staff</Button>
      </form>

      <div className="mt-8 space-y-4">
        {isLoading && <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>}
        {!isLoading && staff.length === 0 && (
          <p className="text-sm text-[var(--color-ink)]/50">No staff yet — add your first stylist above.</p>
        )}
        {!isLoading &&
          staff.map((member) => {
            const workingDays = new Set(member.workingHours.map((w) => w.dayOfWeek));
            return (
              <div key={member.id} className="rounded-md border border-[var(--color-line)] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={member.name} size={40} />
                    <div>
                      <p className="font-display text-lg text-[var(--color-ink)]">{member.name}</p>
                      {member.title && <p className="text-xs text-[var(--color-ink)]/50">{member.title}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {locations.length > 1 && (
                      <select
                        value={member.locationId}
                        onChange={(e) => changeLocation(member, e.target.value)}
                        className="rounded-sm border border-[var(--color-line)] bg-white/40 px-2 py-1 text-xs focus:border-[var(--color-clay)] focus:outline-none"
                      >
                        {locations.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => toggleAvailable(member)}
                      className={
                        "rounded-full px-3 py-1 font-mono text-xs uppercase tracking-wide " +
                        (member.availableOnline
                          ? "bg-[var(--color-sage)]/20 text-[var(--color-sage)]"
                          : "bg-[var(--color-ink)]/10 text-[var(--color-ink)]/50")
                      }
                    >
                      {member.availableOnline ? "Bookable online" : "Hidden"}
                    </button>
                    <Button variant="ghost" onClick={() => removeStaff(member.id)}>
                      Remove
                    </Button>
                  </div>
                </div>

                {locations.length > 1 && (
                  <p className="mt-2 text-xs text-[var(--color-ink)]/40">{locationName(member.locationId)}</p>
                )}

                <div className="mt-4">
                  <p className="mb-2 font-mono text-xs uppercase tracking-wide text-[var(--color-ink)]/50">
                    Working days (click to toggle)
                  </p>
                  <div className="flex gap-2">
                    {DAY_LABELS.map((label, day) => (
                      <button
                        key={day}
                        onClick={() => toggleDayOff(member, day)}
                        className={
                          "h-9 w-9 rounded-full border font-mono text-xs " +
                          (workingDays.has(day)
                            ? "border-[var(--color-clay)] bg-[var(--color-clay)] text-[var(--color-bone)]"
                            : "border-[var(--color-line)] text-[var(--color-ink)]/40")
                        }
                      >
                        {label[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
