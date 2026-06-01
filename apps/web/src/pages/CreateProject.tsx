import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { uploadFiles } from "../lib/upload";
import type { Project } from "../types/project";
import { Shell, Glass, Btn, Field, TextArea, Select } from "../components/ui";

const DEFAULT_DURATION_DAYS = 90;
/** 01/06/2026 (1 June 2026) */
const DEFAULT_START_DATE = "2026-06-01";

function endDateFromStart(startDate: string, durationDays: number): string {
  const d = new Date(`${startDate}T12:00:00`);
  d.setDate(d.getDate() + durationDays);
  return d.toISOString().slice(0, 10);
}

export function CreateProjectPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [landFiles, setLandFiles] = useState<FileList | null>(null);
  const [idFile, setIdFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "crops",
    farmPlan: "",
    fundingGoal: "",
    expectedRoi: "",
    durationDays: String(DEFAULT_DURATION_DAYS),
    startDate: DEFAULT_START_DATE,
    endDate: endDateFromStart(DEFAULT_START_DATE, DEFAULT_DURATION_DAYS),
  });

  function patchForm(patch: Partial<typeof form>) {
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if ("startDate" in patch || "durationDays" in patch) {
        const days = Number(next.durationDays) || DEFAULT_DURATION_DAYS;
        if (next.startDate) next.endDate = endDateFromStart(next.startDate, days);
      }
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const landPhotoUrls = landFiles?.length ? await uploadFiles(landFiles) : [];
      let idDocumentUrl: string | undefined;
      if (idFile) idDocumentUrl = await uploadFiles([idFile]).then((u) => u[0]);

      const data = await api<Project>("/projects", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          fundingGoal: Number(form.fundingGoal),
          expectedRoi: Number(form.expectedRoi),
          durationDays: Number(form.durationDays),
          landPhotoUrls,
          idDocumentUrl,
        }),
      });
      nav(`/projects/${data.id}`, { state: { created: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Link to="/dashboard" className="text-sm text-slate-500 hover:text-lime mb-6 inline-block">
        ← Dashboard
      </Link>
      <Glass className="p-8 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black">Launch a farm project</h1>
          <p className="text-sm text-slate-500 mt-1">
            Auto-approved for demo — goes live on the marketplace immediately.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Project title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <TextArea label="Description" required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="crops">Crops</option>
            <option value="livestock">Livestock</option>
            <option value="fish">Fish / aquaculture</option>
            <option value="poultry">Poultry</option>
            <option value="mixed">Mixed</option>
          </Select>
          <TextArea label="Farm plan" required value={form.farmPlan} onChange={(e) => setForm({ ...form, farmPlan: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Funding goal (USDC)" type="number" required min="100" value={form.fundingGoal} onChange={(e) => setForm({ ...form, fundingGoal: e.target.value })} />
            <Field label="Expected ROI (%)" type="number" required min="1" value={form.expectedRoi} onChange={(e) => setForm({ ...form, expectedRoi: e.target.value })} />
          </div>
          <Field
            label="Duration (days)"
            type="number"
            required
            min="7"
            value={form.durationDays}
            onChange={(e) => patchForm({ durationDays: e.target.value })}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Start date"
              type="date"
              required
              value={form.startDate}
              onChange={(e) => patchForm({ startDate: e.target.value })}
            />
            <Field
              label="End date"
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <p className="text-[10px] text-slate-600 -mt-2">
            End date defaults to start + {form.durationDays} days (you can still edit it).
          </p>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Land photos</span>
            <input type="file" accept="image/*" multiple onChange={(e) => setLandFiles(e.target.files)} className="text-sm text-slate-400" />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">ID document (optional)</span>
            <input type="file" accept="image/*,application/pdf" onChange={(e) => setIdFile(e.target.files?.[0] ?? null)} className="text-sm text-slate-400" />
          </label>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <Btn type="submit" disabled={loading} className="w-full">
            {loading ? "Publishing…" : "Publish to marketplace"}
          </Btn>
        </form>
      </Glass>
    </Shell>
  );
}
