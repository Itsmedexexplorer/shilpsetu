import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AreaField, Btn, Field, Screen, Title, TopBar } from "@/components/shilp/ui";
import { useShilp } from "@/lib/shilp-store";

export const Route = createFileRoute("/edit")({
  head: () => ({
    meta: [
      { title: "Edit your listing — SHILPSETU AI" },
      {
        name: "description",
        content: "Change the title, story, category, material and tags before publishing.",
      },
      { property: "og:title", content: "Make it yours" },
      { property: "og:description", content: "You are always in control of the words." },
    ],
  }),
  component: EditScreen,
});

function EditScreen() {
  const { draft, patchDraft } = useShilp();
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    patchDraft({ keywords: [...draft.keywords, t] });
    setTagInput("");
  };

  return (
    <Screen>
      <TopBar title="Edit & Customize" step="5 / 8" />
      <Title sub="This is a draft written from your words. Change anything.">
        Make it yours.
      </Title>

      <div className="space-y-5 px-5">
        <Field
          label="Title"
          value={draft.title}
          onChange={(e) => patchDraft({ title: e.target.value })}
        />
        <AreaField
          label="Description"
          value={draft.description}
          onChange={(v) => patchDraft({ description: v })}
          rows={6}
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Category"
            value={draft.category}
            onChange={(e) => patchDraft({ category: e.target.value })}
          />
          <Field
            label="Material"
            value={draft.material}
            onChange={(e) => patchDraft({ material: e.target.value })}
          />
        </div>
        <Field
          label="Craft type"
          value={draft.craft}
          onChange={(e) => patchDraft({ craft: e.target.value })}
        />

        <div>
          <p className="text-xs font-bold tracking-[0.12em] uppercase opacity-60">Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {draft.keywords.map((k) => (
              <span
                key={k}
                className="flex items-center gap-1.5 rounded-full bg-sage/25 px-3 py-1.5 text-sm font-bold text-forest"
              >
                {k}
                <button
                  aria-label={`Remove ${k}`}
                  onClick={() =>
                    patchDraft({ keywords: draft.keywords.filter((x) => x !== k) })
                  }
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              placeholder="Add a tag"
              className="h-12 flex-1 rounded-2xl border-2 border-charcoal/12 bg-white px-4 font-semibold outline-none focus:border-terracotta"
            />
            <button
              onClick={addTag}
              className="press rounded-2xl bg-forest px-5 font-bold text-ivory"
            >
              Add
            </button>
          </div>
        </div>

        <button
          onClick={() => {
            patchDraft({
              description: `${draft.description} Each piece is finished by hand, so no two are exactly alike.`,
            });
            toast.success("Suggestion added to your description");
          }}
          className="press flex h-12 w-full items-center justify-center gap-2 rounded-2xl border-2 border-charcoal/15 text-sm font-bold"
        >
          <Sparkles size={16} className="text-terracotta" /> Improve with AI
        </button>

        <p className="rounded-2xl bg-sand p-4 text-xs opacity-70">
          You're always in control. Review AI suggestions before publishing.
        </p>
      </div>

      <div className="mt-auto px-5 pt-8 pb-8">
        <Btn
          onClick={() => {
            toast.success("Changes saved");
            navigate({ to: "/costs" });
          }}
        >
          Save Changes
        </Btn>
      </div>
    </Screen>
  );
}
