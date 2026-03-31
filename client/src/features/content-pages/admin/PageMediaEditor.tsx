import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { SLOT_CONFIG } from "./constants";
import type { PageFormState } from "./types";

type PageMediaEditorProps = {
  pageForm: PageFormState;
  onChange: (updater: (prev: PageFormState) => PageFormState) => void;
};

export function PageMediaEditor({ pageForm, onChange }: PageMediaEditorProps) {
  const visibleSlots = SLOT_CONFIG[pageForm.templateCode];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>슬롯 미디어</Label>
          <p className="text-xs text-muted-foreground mt-1">
            현재 템플릿에서 사용하는 슬롯만 표시합니다.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange((prev) => ({
              ...prev,
              media: [
                ...prev.media,
                {
                  slotKey: visibleSlots[0] ?? "inline",
                  mediaType: "image",
                  url: "",
                  thumbnailUrl: "",
                  altText: "",
                  sortOrder: prev.media.length,
                },
              ],
            }))
          }
        >
          <Plus className="mr-2 h-4 w-4" />미디어 추가
        </Button>
      </div>

      {pageForm.media
        .filter((item) => visibleSlots.includes(item.slotKey))
        .map((item, index) => (
          <div key={`${item.slotKey}-${index}`} className="rounded-lg border p-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>슬롯</Label>
                <Select
                  value={item.slotKey}
                  onValueChange={(value) =>
                    onChange((prev) => ({
                      ...prev,
                      media: prev.media.map((media, mediaIndex) =>
                        mediaIndex === index ? { ...media, slotKey: value } : media,
                      ),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>타입</Label>
                <Select
                  value={item.mediaType}
                  onValueChange={(value: "image" | "video") =>
                    onChange((prev) => ({
                      ...prev,
                      media: prev.media.map((media, mediaIndex) =>
                        mediaIndex === index ? { ...media, mediaType: value } : media,
                      ),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>정렬 순서</Label>
                <Input
                  type="number"
                  value={item.sortOrder}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      media: prev.media.map((media, mediaIndex) =>
                        mediaIndex === index
                          ? { ...media, sortOrder: Number(event.target.value) || 0 }
                          : media,
                      ),
                    }))
                  }
                />
              </div>
              <div className="flex items-end justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onChange((prev) => ({
                      ...prev,
                      media: prev.media.filter((_, mediaIndex) => mediaIndex !== index),
                    }))
                  }
                >
                  <Trash2 className="mr-2 h-4 w-4" />제거
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={item.url}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    media: prev.media.map((media, mediaIndex) =>
                      mediaIndex === index ? { ...media, url: event.target.value } : media,
                    ),
                  }))
                }
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>썸네일 URL</Label>
                <Input
                  value={item.thumbnailUrl}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      media: prev.media.map((media, mediaIndex) =>
                        mediaIndex === index
                          ? { ...media, thumbnailUrl: event.target.value }
                          : media,
                      ),
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>대체 텍스트</Label>
                <Input
                  value={item.altText}
                  onChange={(event) =>
                    onChange((prev) => ({
                      ...prev,
                      media: prev.media.map((media, mediaIndex) =>
                        mediaIndex === index ? { ...media, altText: event.target.value } : media,
                      ),
                    }))
                  }
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
