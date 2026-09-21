import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { APP_NAME } from "@/lib/brand";
import appCss from "../styles.css?url";

const DESCRIPTION =
  "Drop an eSIM QR and get a tap-to-install link for iPhone or Android. I made this so I don't have to scan a QR that's already on my phone.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      { name: "theme-color", content: "#0b0c0f" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: APP_NAME },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: "/og.jpg" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: () => (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-fg">
        <Outlet />
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: "#18191f",
              border: "1px solid #2a2b33",
              color: "#eceef2",
            },
          }}
        />
        <Scripts />
      </body>
    </html>
  ),
});
