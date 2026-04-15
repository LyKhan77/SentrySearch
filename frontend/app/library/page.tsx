import { LibraryTable } from "@/components/library/LibraryTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function LibraryPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Footage Library</h2>
          <p className="text-muted-foreground">Manage and review all your indexed dashcam videos.</p>
        </div>
        <Link href="/">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Add Footage
          </Button>
        </Link>
      </div>

      <LibraryTable />
    </div>
  );
}
