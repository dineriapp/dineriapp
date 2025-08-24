import { Search } from "lucide-react";

import { Label } from "@/components/ui/label";
import { SidebarInput } from "@/components/ui/sidebar";

function SearchForm({ ...props }: React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <div className="relative md:min-w-[400px] sm:block hidden">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <SidebarInput
          id="search"
          placeholder="Type to search..."
          className="h-10 pl-8 w-full"
        />
        <Search className="pointer-events-none absolute top-1/2 left-2 size-5 -translate-y-1/2 opacity-50 select-none" />
      </div>
    </form>
  );
}
export default SearchForm;
