import { component$, useStyles$ } from "@qwik.dev/core";
import { Link, type DocumentHead } from "@qwik.dev/router";
import { Hero } from "../components/Hero";
import { Installation } from "../components/Installation";
import { Usage } from "../components/Usage";
import { Types } from "../components/Types";
import { Position } from "../components/Position";
import { ExpandModes } from "../components/ExpandModes";
import { Other } from "../components/Other";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { useToasterControls } from "~/lib/toaster-context";
import { GITHUB_URL } from "~/lib/versions";
import styles from "./landing.css?inline";

export default component$(() => {
  useStyles$(styles);
  const controls = useToasterControls();

  return (
    <div class="landing">
      <header class="landing-nav container">
        <Logo />
        <nav>
          <Link href="/docs/">Docs</Link>
          <Link href="/docs/changelog/">Changelog</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </header>
      <main class="container">
        <Hero />
        <div class="content">
          <Installation />
          <Usage />
          <Types />
          <Position position={controls.position} />
          <ExpandModes expand={controls.expand} />
          <Other closeButton={controls.closeButton} richColors={controls.richColors} />
        </div>
      </main>
      <Footer />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Qwik Sonner — an opinionated toast component for Qwik",
};
