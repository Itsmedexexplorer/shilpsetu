import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Camera, IndianRupee, Store } from "lucide-react";
import heroImg from "@/assets/artisan-hero.jpg";
import { Btn, Motif } from "@/components/shilp/ui";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Turn Your Craft Into Opportunities — SHILPSETU AI" },
      {
        name: "description",
        content:
          "AI catalog, fair price suggestions and buyers beyond your local market.",
      },
      { property: "og:title", content: "Turn Your Craft Into Opportunities" },
      {
        property: "og:description",
        content: "How SHILPSETU AI helps artisans reach more buyers.",
      },
    ],
  }),
  component: Onboarding,
});

const benefits = [
  { Icon: Camera, t: "AI-powered catalog", s: "A photo and your voice is enough." },
  { Icon: IndianRupee, t: "Fair price suggestions", s: "Costs, time and skill counted." },
  { Icon: Store, t: "Reach beyond your market", s: "Share with buyers anywhere." },
];

function Onboarding() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-full flex-1 flex-col bg-ivory">
      <div className="relative h-[38vh] min-h-[240px] overflow-hidden bg-forest-deep">
        <img
          src={heroImg}
          alt="Indian artisan at work"
          width={1024}
          height={1280}
          className="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ivory via-transparent" />
      </div>

      <div className="animate-rise -mt-10 flex-1 rounded-t-[2rem] bg-ivory px-6 pt-8">
        <Motif className="mb-5" />
        <h1 className="text-[2.4rem] leading-[1.02] font-extrabold text-balance">
          Turn Your Craft Into Opportunities
        </h1>

        <div className="mt-8 space-y-5">
          {benefits.map(({ Icon, t, s }, i) => (
            <div
              key={t}
              className="flex items-start gap-4"
              style={{ animation: `rise-in .5s ${0.1 * i}s both` }}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-forest text-ivory">
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold">{t}</p>
                <p className="text-sm opacity-65">{s}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-6 pt-6 pb-8">
        <Btn onClick={() => navigate({ to: "/language" })}>Continue</Btn>
        <Link to="/language" className="block py-2 text-center">
          <span className="text-sm font-semibold opacity-55">Skip</span>
        </Link>
      </div>
    </div>
  );
}
