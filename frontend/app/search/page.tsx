import { Suspense } from "react";

import SearchView from "@/components/search/SearchView";

// useSearchParams (inside SearchView) must be wrapped in a Suspense boundary.
export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchView />
    </Suspense>
  );
}
