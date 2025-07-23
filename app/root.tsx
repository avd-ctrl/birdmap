import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from "react";

import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

function NavBar() {
  return (
    <nav className="w-full bg-green-900 text-green-100 shadow-lg fixed top-0 left-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
        <span className="text-2xl font-bold tracking-wide">BirdMap</span>
        <div className="flex gap-6 text-lg">
          <a href="#" className="hover:text-green-300 transition">Map</a>
          <a href="#" className="hover:text-green-300 transition">Trails</a>
          <a href="#" className="hover:text-green-300 transition">About</a>
        </div>
      </div>
    </nav>
  );
}

function DialogflowMessenger() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
    script.async = true;
    document.body.appendChild(script);
    // Add the df-messenger element
    const df = document.createElement("df-messenger");
    df.setAttribute("intent", "WELCOME");
    df.setAttribute("chat-title", "NewAgent");
    df.setAttribute("agent-id", "bfbfdf14-8ddb-4ff2-b3f6-4ac51abe4dc8");
    df.setAttribute("language-code", "en");
    document.body.appendChild(df);
    return () => {
      document.body.removeChild(script);
      document.body.removeChild(df);
    };
  }, []);
  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <NavBar />
        <div className="pt-20">{children}</div>
        <DialogflowMessenger />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
