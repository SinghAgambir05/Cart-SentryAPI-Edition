import { SiteHeader } from "@/components/SiteHeader";
import { Hero } from "@/components/Hero";
import { ProcessSteps } from "@/components/ProcessSteps";
import { Dashboard } from "@/components/Dashboard";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <ProcessSteps />
      <Dashboard />
      <SiteFooter />
    </main>
  );
}
