"use client";

import { useCallback, useState } from "react";
import { Upload, Download, Loader2, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateDeconstructedOutfit } from "@/actions/generate-outfit";
import { type ExtractType } from "@/lib/extract-types";
import { Navigation } from "@/components/navigation";

const EXTRACT_OPTIONS: { value: ExtractType; label: string }[] = [
  { value: "full_body", label: "Full outfit" },
  { value: "shoes", label: "Shoes" },
  { value: "bag", label: "Bag" },
  { value: "sofa", label: "Sofa" },
  { value: "daily", label: "Daily items" },
  { value: "accessory", label: "Accessories" },
  { value: "custom", label: "Custom" },
];

export default function GeneratePage() {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractType, setExtractType] = useState<ExtractType>("full_body");
  const [customItem, setCustomItem] = useState("");

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setGeneratedImageUrl(null);

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Please use JPEG, PNG, or WebP format");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      const { key, publicUrl } = data;
      setUploadKey(key);
      setOriginalImageUrl(publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!originalImageUrl) return;

    if (extractType === "custom" && !customItem.trim()) {
      setError("Please select an extraction type or enter a custom item (e.g. earrings, necklace)");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await generateDeconstructedOutfit(
        originalImageUrl,
        extractType,
        extractType === "custom" ? customItem : undefined
      );

      if (result.ok) {
        setGeneratedImageUrl(result.imageUrl);
      } else {
        setError(result.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [originalImageUrl, extractType, customItem]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );
  const onDragOver = useCallback((e: React.DragEvent) => e.preventDefault(), []);
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDownload = useCallback(() => {
    if (!generatedImageUrl) return;
    const a = document.createElement("a");
    a.href = generatedImageUrl;
    a.download = `stylelayer-${Date.now()}.png`;
    a.click();
  }, [generatedImageUrl]);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              StyleLayer AI
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Deconstruct your outfit into a high-fashion layout
            </p>
          </div>
          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-stone-500">Extract type:</span>
            {EXTRACT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={extractType === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setExtractType(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
          {extractType === "custom" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500">Custom item:</span>
              <input
                type="text"
                placeholder="e.g. earrings, necklace, watch..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                className="rounded-md border border-stone-300 px-3 py-2 text-sm ring-stone-200 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4">
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              className="relative flex min-h-[280px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-white p-6 transition-colors hover:border-stone-400"
            >
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={onInputChange}
                disabled={loading}
              />
              {originalImageUrl ? (
                <img
                  src={originalImageUrl}
                  alt="Uploaded outfit"
                  className="max-h-[320px] max-w-full rounded-lg object-contain"
                />
              ) : (
                <>
                  <Upload className="mb-3 h-12 w-12 text-stone-400" />
                  <p className="text-center text-sm font-medium text-stone-600">
                    Drag & drop or click to upload
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    JPEG, PNG or WebP, max 10MB
                  </p>
                </>
              )}
            </div>
            {originalImageUrl && (
              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-stone-200 bg-white p-6">
              {loading && (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 animate-shimmer rounded-lg bg-stone-200" />
                  <p className="text-sm text-stone-500">Generating your layout…</p>
                  <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
                </div>
              )}
              {!loading && generatedImageUrl && (
                <div className="w-full space-y-4">
                  <img
                    src={generatedImageUrl}
                    alt="Deconstructed outfit"
                    className="max-h-[320px] w-full rounded-lg object-contain"
                  />
                  <Button
                    onClick={handleDownload}
                    className="w-full sm:w-auto"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              )}
              {!loading && !generatedImageUrl && !originalImageUrl && (
                <>
                  <ImageIcon className="mb-3 h-12 w-12 text-stone-300" />
                  <p className="text-center text-sm text-stone-400">
                    Your deconstructed outfit will appear here
                  </p>
                </>
              )}
              {!loading && originalImageUrl && !generatedImageUrl && !error && (
                <p className="text-sm text-stone-500">Click Generate to create your layout.</p>
              )}
            </div>
          </section>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}
