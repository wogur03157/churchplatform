import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageIcon, Link, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (url: string | null, key?: string | null) => void;
  uploadEndpoint?: string;
  className?: string;
};

export function ImageInput({
  value,
  onChange,
  uploadEndpoint = "/api/layout-settings/upload-image",
  className,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"url" | "file">("url");

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("업로드 실패");
      const payload = (await res.json()) as { url: string; key: string };
      onChange(payload.url, payload.key);
    } catch (e: any) {
      alert(e?.message ?? "업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-md border bg-muted p-0.5 w-fit text-xs">
        <button
          type="button"
          onClick={() => setTab("url")}
          className={cn(
            "flex items-center gap-1 rounded px-2.5 py-1 transition-colors",
            tab === "url" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link className="h-3 w-3" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setTab("file")}
          className={cn(
            "flex items-center gap-1 rounded px-2.5 py-1 transition-colors",
            tab === "file" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="h-3 w-3" />
          파일
        </button>
      </div>

      {/* Input area */}
      {tab === "url" ? (
        <Input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null, null)}
          placeholder="https://example.com/image.jpg"
        />
      ) : (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-full"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {uploading ? "업로드 중..." : "파일 선택"}
          </Button>
        </>
      )}

      {/* Preview */}
      {value && (
        <div className="relative overflow-hidden rounded-lg border">
          <img src={value} alt="" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
            title="이미지 제거"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
