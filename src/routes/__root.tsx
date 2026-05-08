import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import BackgroundAudio from "#/components/BackgroundAudio";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      { property: "og:title", content: "Fledge" },
      {
        property: "og:description",
        content: "Worship Unscripted",
      },
      { property: "og:image", content: "/favicon-32x32.png" },

      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Fledge",
        description: "Worship Unscripted",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>

      <body>
        <QueryClientProvider client={queryClient}>
          <BackgroundAudio />
          {children}
          <TanStackDevtools
            config={{
              position: "bottom-left",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
          <Toaster richColors />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
