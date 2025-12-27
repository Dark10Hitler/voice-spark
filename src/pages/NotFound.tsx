import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Seo } from "@/components/seo/Seo";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <AppShell>
      <Seo
        title="404 | Premium Text-to-Speech Pro"
        description="Page not found. Return to Premium Text-to-Speech Pro."
        canonicalPath={location.pathname}
      />

      <div className="glass-card rounded-3xl p-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">This page doesn’t exist.</p>
        <div className="mt-6 flex justify-center">
          <a href="/">
            <Button variant="hero">Return to Home</Button>
          </a>
        </div>
      </div>
    </AppShell>
  );
};

export default NotFound;
