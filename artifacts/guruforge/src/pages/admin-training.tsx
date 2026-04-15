import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";

const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/+/g, "/").replace(/\/$/, "");

interface TrainingStats {
  annotatedTurns: number;
  avgQuality: number;
  avgDomainRelevance: number;
  qualityDistribution: { high: number; medium: number; low: number };
  totalMemoriesExtracted: number;
  domainCoverage: Array<{ topic: string; count: number }>;
  recentExports: Array<{
    id: number;
    format: string;
    status: string;
    rowCount: number;
    fileSize: number | null;
    createdAt: string;
    completedAt: string | null;
    errorMessage: string | null;
  }>;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTraining() {
  const { getAccessToken } = usePrivy();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState("instruction_pairs");
  const [exportGuruId, setExportGuruId] = useState("");
  const [exportMinQuality, setExportMinQuality] = useState("0.3");
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const res = await fetch(`${API_BASE}/admin/training-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Admin access required");
        throw new Error("Failed to fetch stats");
      }
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  async function handleExport() {
    setExporting(true);
    setExportMessage(null);
    try {
      const token = await getAccessToken();
      const filters: Record<string, unknown> = {};
      if (exportGuruId) filters.guruId = Number(exportGuruId);
      if (exportMinQuality) filters.minQuality = Number(exportMinQuality);

      const res = await fetch(`${API_BASE}/admin/training-export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format: exportFormat, filters }),
      });
      if (!res.ok) throw new Error("Export request failed");
      const data = await res.json();
      setExportMessage(`Export started (ID: ${data.exportId}). Refresh to see progress.`);
      setTimeout(fetchStats, 3000);
    } catch (err) {
      setExportMessage(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-[1000px] mx-auto">
        <p className="text-neutral-400 text-sm font-light">Loading training data stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 md:px-10 py-10 md:py-14 max-w-[1000px] mx-auto">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const totalQuality = stats.qualityDistribution.high + stats.qualityDistribution.medium + stats.qualityDistribution.low;
  const highPct = totalQuality > 0 ? (stats.qualityDistribution.high / totalQuality) * 100 : 0;
  const medPct = totalQuality > 0 ? (stats.qualityDistribution.medium / totalQuality) * 100 : 0;
  const lowPct = totalQuality > 0 ? (stats.qualityDistribution.low / totalQuality) * 100 : 0;

  return (
    <div className="px-6 md:px-10 py-10 md:py-14 max-w-[1000px] mx-auto">
      <div className="mb-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-1">ADMIN</p>
        <h1 className="text-2xl font-light tracking-tight">Training Data</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="border border-neutral-200 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-2">ANNOTATED TURNS</p>
          <p className="text-2xl font-light">{stats.annotatedTurns.toLocaleString()}</p>
        </div>
        <div className="border border-neutral-200 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-2">AVG QUALITY</p>
          <p className="text-2xl font-light">{(stats.avgQuality * 100).toFixed(1)}%</p>
        </div>
        <div className="border border-neutral-200 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-2">DOMAIN RELEVANCE</p>
          <p className="text-2xl font-light">{(stats.avgDomainRelevance * 100).toFixed(1)}%</p>
        </div>
        <div className="border border-neutral-200 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-2">MEMORIES EXTRACTED</p>
          <p className="text-2xl font-light">{stats.totalMemoriesExtracted.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="border border-neutral-200 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-4">QUALITY DISTRIBUTION</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-500">High (0.7+)</span>
                <span className="font-medium">{stats.qualityDistribution.high}</span>
              </div>
              <div className="h-2 bg-neutral-100 w-full">
                <div className="h-2 bg-neutral-900" style={{ width: `${highPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-500">Medium (0.3-0.7)</span>
                <span className="font-medium">{stats.qualityDistribution.medium}</span>
              </div>
              <div className="h-2 bg-neutral-100 w-full">
                <div className="h-2 bg-neutral-400" style={{ width: `${medPct}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-neutral-500">Low (&lt;0.3)</span>
                <span className="font-medium">{stats.qualityDistribution.low}</span>
              </div>
              <div className="h-2 bg-neutral-100 w-full">
                <div className="h-2 bg-neutral-200" style={{ width: `${lowPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="border border-neutral-200 p-5">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-4">DOMAIN COVERAGE</p>
          {stats.domainCoverage.length === 0 ? (
            <p className="text-xs text-neutral-400">No topics annotated yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.domainCoverage.map((d) => (
                <span
                  key={d.topic}
                  className="text-xs border border-neutral-200 px-2 py-1 text-neutral-600"
                >
                  {d.topic} ({d.count})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border border-neutral-200 p-5 mb-10">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-4">EXPORT TRAINING DATA</p>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 block mb-1">FORMAT</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white"
            >
              <option value="instruction_pairs">Instruction Pairs</option>
              <option value="preference_pairs">Preference Pairs</option>
              <option value="knowledge_distillation">Knowledge Distillation</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 block mb-1">GURU ID</label>
            <input
              type="text"
              value={exportGuruId}
              onChange={(e) => setExportGuruId(e.target.value)}
              placeholder="All"
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 block mb-1">MIN QUALITY</label>
            <input
              type="text"
              value={exportMinQuality}
              onChange={(e) => setExportMinQuality(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full border border-neutral-900 bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800 disabled:opacity-50"
            >
              {exporting ? "Exporting..." : "Start Export"}
            </button>
          </div>
        </div>
        {exportMessage && (
          <p className="text-xs text-neutral-500 mt-2">{exportMessage}</p>
        )}
      </div>

      <div className="border border-neutral-200 p-5">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-4">EXPORT HISTORY</p>
        {stats.recentExports.length === 0 ? (
          <p className="text-xs text-neutral-400">No exports yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-left">
                  <th className="pb-2 font-medium text-neutral-500">ID</th>
                  <th className="pb-2 font-medium text-neutral-500">FORMAT</th>
                  <th className="pb-2 font-medium text-neutral-500">STATUS</th>
                  <th className="pb-2 font-medium text-neutral-500">ROWS</th>
                  <th className="pb-2 font-medium text-neutral-500">SIZE</th>
                  <th className="pb-2 font-medium text-neutral-500">CREATED</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentExports.map((exp) => (
                  <tr key={exp.id} className="border-b border-neutral-100">
                    <td className="py-2 text-neutral-600">{exp.id}</td>
                    <td className="py-2 text-neutral-600">{exp.format.replace(/_/g, " ")}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                          exp.status === "completed"
                            ? "bg-neutral-100 text-neutral-700"
                            : exp.status === "failed"
                            ? "bg-red-50 text-red-600"
                            : "bg-neutral-50 text-neutral-500"
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-2 text-neutral-600">{exp.rowCount.toLocaleString()}</td>
                    <td className="py-2 text-neutral-600">{formatBytes(exp.fileSize)}</td>
                    <td className="py-2 text-neutral-600">{formatDate(exp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
