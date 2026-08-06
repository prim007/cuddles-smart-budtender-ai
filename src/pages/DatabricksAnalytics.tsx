import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RefreshCw, Play, Upload, Database } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  state?: string;
}

interface QueryResult {
  columns: string[];
  rows: string[][];
  row_count: number;
}

const call = async (body: Record<string, unknown>) => {
  const { data, error } = await supabase.functions.invoke("databricks-analytics", { body });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.details ?? data.error);
  return data;
};

const DatabricksAnalytics = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [exportable, setExportable] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [catalog, setCatalog] = useState("workspace");
  const [schema, setSchema] = useState("cuddles");
  const [statement, setStatement] = useState("SELECT * FROM workspace.cuddles.cuddles_chat_conversations LIMIT 20");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await call({ action: "warehouses" });
      setWarehouses(data.warehouses ?? []);
      setExportable(data.exportable ?? []);
      setSelected(data.exportable ?? []);
      if (!warehouseId && data.warehouses?.[0]?.id) setWarehouseId(data.warehouses[0].id);
    } catch (err) {
      toast.error("Could not reach Databricks", {
        description: err instanceof Error ? err.message : undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleTable = (table: string) =>
    setSelected((prev) => (prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]));

  const handleExport = async () => {
    if (!warehouseId) return toast.error("Pick a SQL warehouse first");
    setExporting(true);
    try {
      const data = await call({ action: "export", warehouse_id: warehouseId, catalog, schema, tables: selected });
      const total = (data.exported ?? []).reduce((sum: number, e: { rows: number }) => sum + e.rows, 0);
      toast.success(`Exported ${total} rows into ${catalog}.${schema}`);
    } catch (err) {
      toast.error("Export failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setExporting(false);
    }
  };

  const handleQuery = async () => {
    if (!warehouseId) return toast.error("Pick a SQL warehouse first");
    setRunning(true);
    try {
      const data = await call({ action: "query", warehouse_id: warehouseId, statement });
      setResult(data as QueryResult);
    } catch (err) {
      toast.error("Query failed", { description: err instanceof Error ? err.message : undefined });
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-bold">Databricks Analytics</h1>
        <p className="text-muted-foreground">
          Sync Cuddles data into your Databricks lakehouse and run read-only analysis against it.
        </p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" /> SQL warehouse
            </CardTitle>
            <CardDescription>Queries and exports run on this warehouse.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {warehouses.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground">No warehouses found on this Databricks workspace.</p>
          )}
          {warehouses.map((w) => (
            <Button
              key={w.id}
              variant={warehouseId === w.id ? "default" : "outline"}
              size="sm"
              onClick={() => setWarehouseId(w.id)}
            >
              {w.name}
              {w.state && <Badge variant="secondary" className="ml-2">{w.state}</Badge>}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Cuddles data</CardTitle>
          <CardDescription>
            Each table lands as <code>cuddles_&lt;table&gt;</code> in the target schema and is refreshed on every run.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="catalog">Catalog</label>
              <Input id="catalog" value={catalog} onChange={(e) => setCatalog(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="schema">Schema</label>
              <Input id="schema" value={schema} onChange={(e) => setSchema(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {exportable.map((table) => (
              <Button
                key={table}
                type="button"
                size="sm"
                variant={selected.includes(table) ? "default" : "outline"}
                onClick={() => toggleTable(table)}
              >
                {table}
              </Button>
            ))}
          </div>
          <Button onClick={() => void handleExport()} disabled={exporting || !selected.length}>
            <Upload className="mr-2 h-4 w-4" />
            {exporting ? "Exporting…" : `Export ${selected.length} table${selected.length === 1 ? "" : "s"}`}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Run analysis</CardTitle>
          <CardDescription>Read-only SQL (SELECT, SHOW, DESCRIBE) against your lakehouse.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={4}
            className="font-mono text-sm"
            aria-label="SQL statement"
          />
          <Button onClick={() => void handleQuery()} disabled={running}>
            <Play className="mr-2 h-4 w-4" />
            {running ? "Running…" : "Run query"}
          </Button>

          {result && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {result.columns.map((c) => (
                      <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(result.rows ?? []).map((row, i) => (
                    <tr key={i} className="border-t">
                      {row.map((cell, j) => (
                        <td key={j} className="max-w-xs truncate px-3 py-2">{cell ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default DatabricksAnalytics;
