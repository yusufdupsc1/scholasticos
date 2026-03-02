"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Download,
  Eye,
  RefreshCw,
  Printer,
  File,
  FileText,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { templateLabel } from "@/components/students/template-selector";

export interface StudentRecordItem {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  periodType: string;
  periodLabel: string;
  recordType: string;
  source: string;
  generatedAt: string;
}

interface ReportPreviewProps {
  loading: boolean;
  selectedStudentName: string;
  grouped: Record<string, StudentRecordItem[]>;
  onRegenerate: (record: StudentRecordItem) => void;
  regeneratingId: string | null;
  previewRecordId?: string | null;
  onPreviewRecordHandled?: () => void;
}

function isDataPdfUrl(value: string) {
  return /^data:application\/pdf;base64,/i.test(value);
}

function isSupportedUrl(value: string) {
  return /^(https?:\/\/|\/|blob:)/i.test(value);
}

function toBlobUrl(value: string): string | null {
  if (!isDataPdfUrl(value)) return value;

  try {
    const [meta, base64] = value.split(",", 2);
    if (!meta || !base64) return null;

    const mime = meta.match(/^data:([^;]+);base64$/i)?.[1] ?? "application/pdf";
    const binary = window.atob(base64);
    const arrayBuffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mime });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function ReportPreview({
  loading,
  selectedStudentName,
  grouped,
  onRegenerate,
  regeneratingId,
  previewRecordId = null,
  onPreviewRecordHandled,
}: ReportPreviewProps) {
  const [manualPreviewId, setManualPreviewId] = useState<string | null>(null);

  const groups = Object.entries(grouped);
  const recordById = useMemo(
    () =>
      Object.fromEntries(
        Object.values(grouped)
          .flat()
          .map((record) => [record.id, record]),
      ) as Record<string, StudentRecordItem>,
    [grouped],
  );

  const activePreviewId = manualPreviewId ?? previewRecordId ?? null;
  const previewRecord = activePreviewId
    ? (recordById[activePreviewId] ?? null)
    : null;

  const previewUrl = useMemo(() => {
    if (!previewRecord) return null;
    if (isDataPdfUrl(previewRecord.fileUrl)) {
      return toBlobUrl(previewRecord.fileUrl);
    }
    return isSupportedUrl(previewRecord.fileUrl) ? previewRecord.fileUrl : null;
  }, [previewRecord]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openInNewTab(record: StudentRecordItem) {
    const resolved = isDataPdfUrl(record.fileUrl)
      ? toBlobUrl(record.fileUrl)
      : isSupportedUrl(record.fileUrl)
        ? record.fileUrl
        : null;
    if (!resolved) return;

    window.open(resolved, "_blank", "noopener,noreferrer");
    if (resolved.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(resolved), 60_000);
    }
  }

  function downloadRecord(record: StudentRecordItem) {
    const resolved = isDataPdfUrl(record.fileUrl)
      ? toBlobUrl(record.fileUrl)
      : isSupportedUrl(record.fileUrl)
        ? record.fileUrl
        : null;
    if (!resolved) return;

    const link = document.createElement("a");
    link.href = resolved;
    link.download = record.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (resolved.startsWith("blob:")) {
      window.setTimeout(() => URL.revokeObjectURL(resolved), 5_000);
    }
  }

  function printRecord(record: StudentRecordItem) {
    const resolved = isDataPdfUrl(record.fileUrl)
      ? toBlobUrl(record.fileUrl)
      : isSupportedUrl(record.fileUrl)
        ? record.fileUrl
        : null;
    if (!resolved) return;

    if (resolved.startsWith("blob:") || resolved.startsWith("data:")) {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>${record.title}</title>
            <style>
              @page { margin: 0; }
              body { margin: 0; padding: 0; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <iframe src="${resolved}" onload="this.contentWindow.print();"></iframe>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.open(resolved, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Generated Records</h2>
        {selectedStudentName ? (
          <p className="text-sm text-muted-foreground">{selectedStudentName}</p>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading records...</p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No records generated yet.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map(([groupKey, items]) => (
            <div
              key={groupKey}
              className="rounded-xl border border-border/80 bg-muted/10 p-3"
            >
              <p className="mb-3 text-sm font-semibold">
                {groupKey.replace(":", " - ")}
              </p>
              <div className="space-y-2">
                {items.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col gap-2 rounded-lg border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {record.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {templateLabel(record.recordType)} ·{" "}
                        {new Date(record.generatedAt).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {record.source}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          console.log(
                            "[ReportPreview] Preview button clicked, ID:",
                            record.id,
                          );
                          setManualPreviewId(record.id);
                        }}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => downloadRecord(record)}
                        disabled={
                          !isDataPdfUrl(record.fileUrl) &&
                          !isSupportedUrl(record.fileUrl)
                        }
                      >
                        <Download className="mr-1 h-3.5 w-3.5" /> Download
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onRegenerate(record)}
                        disabled={regeneratingId === record.id}
                      >
                        <RefreshCw
                          className={`mr-1 h-3.5 w-3.5 ${regeneratingId === record.id ? "animate-spin" : ""}`}
                        />
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(activePreviewId)}
        onOpenChange={(open) => {
          if (!open) {
            setManualPreviewId(null);
            onPreviewRecordHandled?.();
          }
        }}
      >
        <DialogContent className="w-[min(96vw,80rem)] max-w-7xl p-0 gap-0 overflow-hidden">
          {/* Header with close button */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
            <div>
              <DialogTitle className="text-lg font-semibold">
                {previewRecord?.title ?? "Record Preview"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {previewRecord
                  ? `${templateLabel(previewRecord.recordType)} · ${previewRecord.periodLabel} · ${new Date(previewRecord.generatedAt).toLocaleString()}`
                  : "Select a record to preview"}
              </DialogDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setManualPreviewId(record.id);
              }}
            >
              <Eye className="mr-1 h-3.5 w-3.5" /> Preview
            </Button>
          </div>

          {/* Preview Content */}
          {previewRecord && previewUrl ? (
            <div className="flex flex-col">
              <div className="h-[70vh] overflow-hidden bg-muted/5">
                <iframe
                  src={previewUrl}
                  title={`${previewRecord.title} Preview`}
                  className="h-full w-full border-0"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {previewRecord.recordType}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {previewRecord.periodLabel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => printRecord(previewRecord)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => downloadRecord(previewRecord)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[60vh]">
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-lg">Unable to load preview</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Please try clicking Preview again or download the PDF.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
