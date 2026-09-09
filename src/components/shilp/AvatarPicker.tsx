import { Camera, Trash2, User } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { fileToAvatar } from "@/lib/image";
import { cn } from "@/lib/utils";

export function AvatarPicker({
  value,
  onChange,
  name,
  size = "lg",
  label = "Change photo",
  removeLabel = "Remove photo",
}: {
  value?: string;
  onChange: (dataUrl: string) => void;
  name?: string;
  size?: "sm" | "lg";
  label?: string;
  removeLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const box = size === "lg" ? "h-24 w-24" : "h-20 w-20";

  const pick = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await fileToAvatar(file));
      toast.success("Photo updated");
    } catch {
      toast.error("Could not use that image");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => input.current?.click()}
          aria-label={label}
          className={cn(
            "press grid place-items-center overflow-hidden rounded-3xl bg-sand text-forest ring-2 ring-charcoal/10",
            box,
            busy && "opacity-60",
          )}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : name ? (
            <span className="font-display text-3xl font-extrabold">
              {name.trim().charAt(0).toUpperCase()}
            </span>
          ) : (
            <User size={28} />
          )}
        </button>
        <span className="pointer-events-none absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-full bg-terracotta text-white ring-4 ring-ivory">
          <Camera size={15} />
        </span>
      </div>

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="press rounded-xl bg-forest px-4 py-2 text-sm font-bold text-ivory"
        >
          {label}
        </button>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="press mt-2 flex items-center gap-1.5 text-xs font-bold text-terracotta"
          >
            <Trash2 size={13} /> {removeLabel}
          </button>
        ) : (
          <p className="mt-2 text-xs opacity-55">JPG or PNG, square looks best.</p>
        )}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
