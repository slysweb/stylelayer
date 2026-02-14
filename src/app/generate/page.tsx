"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, Download, Loader2, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateDeconstructedOutfit } from "@/actions/generate-outfit";
import { type ExtractType } from "@/lib/extract-types";
import { Navigation } from "@/components/navigation";

const EXTRACT_OPTIONS: { value: ExtractType; label: string; icon: string }[] = [
  { value: "full_body", label: "Full Outfit", icon: "👗" },
  { value: "shoes", label: "Shoes", icon: "👟" },
  { value: "bag", label: "Bag", icon: "👜" },
  { value: "sofa", label: "Sofa", icon: "🛋️" },
  { value: "daily", label: "Daily Items", icon: "🧴" },
  { value: "accessory", label: "Accessories", icon: "💍" },
  { value: "custom", label: "Custom", icon: "✏️" },
];

export default function GeneratePage() {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractType, setExtractType] = useState<ExtractType>("full_body");
  const [customItem, setCustomItem] = useState("");
  const [isDragging, setIsDragging] = useState(false);

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
      setError(
        "Please enter a custom item to extract (e.g. earrings, necklace)"
      );
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
        window.dispatchEvent(new Event("credits-updated"));
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
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setIsDragging(false), []);
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

  const handleReset = useCallback(() => {
    setOriginalImageUrl(null);
    setGeneratedImageUrl(null);
    setUploadKey(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image
              src="/logo.jpeg"
              alt="StyleLayer AI"
              width={814}
              height={138}
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Page title */}
        <div className="mb-8 text-center">
          <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Generate Flat Lay
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            Upload a photo, choose what to extract, and let AI do the rest.
          </p>
        </div>

        {/* Extract type selector */}
        <div className="mb-8">
          <p className="mb-3 text-center text-sm font-medium text-stone-600">
            What would you like to extract?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXTRACT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setExtractType(opt.value)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  extractType === opt.value
                    ? "bg-stone-900 text-white shadow-sm"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50"
                }`}
              >
                <span className="text-base">{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
          {extractType === "custom" && (
            <div className="mt-4 flex justify-center">
              <input
                type="text"
                placeholder="Enter item to extract, e.g. earrings, watch, hat..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                className="w-full max-w-md rounded-lg border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>
          )}
        </div>

        {/* Main workspace */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left — Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
                Original
              </h2>
              {originalImageUrl && (
                <button
                  onClick={handleReset}
                  className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-600"
                >
                  Clear & re-upload
                </button>
              )}
            </div>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={`relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-white transition-all ${
                isDragging
                  ? "border-stone-900 bg-stone-50"
                  : originalImageUrl
                    ? "border-transparent"
                    : "border-stone-300 hover:border-stone-400"
              }`}
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
                  alt="Uploaded photo"
                  className="max-h-[420px] max-w-full rounded-lg object-contain p-4"
                />
              ) : (
                <div className="flex flex-col items-center px-6 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
                    <Upload className="h-7 w-7 text-stone-400" />
                  </div>
                  <p className="mt-5 text-sm font-medium text-stone-700">
                    Drag & drop your photo here
                  </p>
                  <p className="mt-1.5 text-xs text-stone-400">
                    or click to browse &middot; JPEG, PNG, WebP &middot; Max 10MB
                  </p>
                </div>
              )}
            </div>

            {/* Generate button */}
            {originalImageUrl && (
              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="lg"
                className="w-full rounded-xl text-base"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-5 w-5" />
                )}
                {loading ? "Generating..." : "Generate Flat Lay"}
              </Button>
            )}
          </div>

          {/* Right — Result */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400">
              Result
            </h2>
            <div className="flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-white">
              {loading && (
                <div className="flex flex-col items-center gap-5 px-6 py-12">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-stone-100" />
                    <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-stone-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-stone-700">
                      AI is working on your image...
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      This usually takes 15-30 seconds
                    </p>
                  </div>
                </div>
              )}

              {!loading && generatedImageUrl && (
                <div className="w-full p-4">
                  <img
                    src={generatedImageUrl}
                    alt="Generated flat lay"
                    className="max-h-[420px] w-full rounded-lg object-contain"
                  />
                </div>
              )}

              {!loading && !generatedImageUrl && !originalImageUrl && (
                <div className="flex flex-col items-center px-6 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50">
                    <ImageIcon className="h-7 w-7 text-stone-300" />
                  </div>
                  <p className="mt-5 text-sm text-stone-400">
                    Your extracted flat lay will appear here
                  </p>
                </div>
              )}

              {!loading && originalImageUrl && !generatedImageUrl && !error && (
                <div className="flex flex-col items-center px-6 py-12">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50">
                    <Sparkles className="h-7 w-7 text-stone-300" />
                  </div>
                  <p className="mt-5 text-sm text-stone-400">
                    Click &quot;Generate Flat Lay&quot; to start
                  </p>
                </div>
              )}
            </div>

            {/* Download button */}
            {!loading && generatedImageUrl && (
              <Button
                onClick={handleDownload}
                variant="outline"
                size="lg"
                className="w-full rounded-xl text-base"
              >
                <Download className="mr-2 h-5 w-5" />
                Download Image
              </Button>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            <p className="font-medium">Something went wrong</p>
            <p className="mt-1 text-red-600">{error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
