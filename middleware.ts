import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only the Sanity Studio requires Clerk auth — everything else is public.
const isProtectedRoute = createRouteMatcher(["/studio(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
