"use client";

import { useCallback, useState } from "react";
import { Upload, Download, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateDeconstructedOutfit } from "@/actions/generate-outfit";

type LayoutStyle = "knolling" | "editorial";

export default function Home() {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("knolling");

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setGeneratedImageUrl(null);

      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        setError("Please use JPEG, PNG, or WebP.");
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

        setLoading(true);
        const result = await generateDeconstructedOutfit(publicUrl, layoutStyle);
        setLoading(false);

        if (result.ok) {
          setGeneratedImageUrl(result.imageUrl);
        } else {
          setError(result.error);
        }
      } catch (e) {
        setLoading(false);
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    },
    [layoutStyle]
  );

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
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            StyleLayer AI
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Deconstruct your outfit into a high-fashion layout
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <span className="text-sm text-stone-500">Layout:</span>
          <Button
            variant={layoutStyle === "knolling" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayoutStyle("knolling")}
          >
            Knolling
          </Button>
          <Button
            variant={layoutStyle === "editorial" ? "default" : "outline"}
            size="sm"
            onClick={() => setLayoutStyle("editorial")}
          >
            Editorial
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Upload + original */}
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
          </section>

          {/* Right: Result or placeholder */}
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
                <p className="text-sm text-stone-500">Upload an image to generate.</p>
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
