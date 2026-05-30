import { readFileSync } from "fs";
import { join } from "path";
import Link from "next/link";
import PageNav from "@/components/PageNav";
import { getJsonFromR2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

interface Project {
  id: string;
  title: string;
  bgColor: string;
  imageUrl?: string;
  videoUrl?: string;
  span?: number;
}

/** danield.design pattern: 2-up (span 3) rows + 3-up (span 2) rows
 *  Cycle: [3,3] → [2,2,2] → repeat. Lone remainder → span 6 */
function getSpan(i: number, total: number): number {
  const pos = i % 5;
  if (pos < 2) return 3;   // 2-up tall (first 2 of cycle)
  if (pos === 2 && i === total - 1) return 6; // lone last → full
  return 2;                // 3-up square (last 3 of cycle)
}

function thumbClass(span: number): string {
  if (span === 6) return "proj-thumb--full";
  if (span === 4) return "proj-thumb--wide2";
  if (span >= 3)  return "proj-thumb--wide";
  return "proj-thumb--narrow";
}

export default async function Home() {
  const projects =
    (await getJsonFromR2<Project[]>("data/projects.json")) ??
    (JSON.parse(readFileSync(join(process.cwd(), "data", "projects.json"), "utf-8")) as Project[]);

  return (
    <div className="pt-[0.66rem] pb-16 home-page">
      <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(to bottom, #ffffff, #f0ece6)" }} />
      <PageNav />
      <section className="home-proj-section">
        <div className="proj-grid">
          {projects.map((p, i) => {
            const span = p.span ?? getSpan(i, projects.length);
            return (
              <Link key={p.id} href={`/projects/${p.id}`}
                className="block group relative"
                style={{ gridColumn: `span ${span}` }}>
                <div
                  className={`proj-thumb ${thumbClass(span)}`}
                  style={{ background: p.bgColor }}>
                  {p.videoUrl
                    ? <video src={p.videoUrl} autoPlay muted loop playsInline />
                    : p.imageUrl
                    ? <img src={p.imageUrl} alt={p.title} />
                    : null}
                </div>
                <span className="proj-hover-label">{p.title}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
