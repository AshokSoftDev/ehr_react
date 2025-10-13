import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageSkeleton } from "@/layouts/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Filter configuration types
type FilterInputConfig = {
  type: "input";
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  onChange: (value: string) => void;
};

type FilterSelectConfig = {
  type: "select";
  name: string;
  label?: string;
  placeholder?: string;
  className?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
};

type FilterConfig = FilterInputConfig | FilterSelectConfig;

type ActionButtonConfig = {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
};

interface AdvancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  
  // New filter system
  filters?: FilterConfig[];
  
  // Action buttons (replaces onAdd)
  actionButtons?: ActionButtonConfig[];
  
  // Pagination props
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  page?: number;
  limit?: number;
  total?: number;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  filters = [],
  actionButtons = [],
  onPageChange,
  onLimitChange,
  page = 1,
  limit = 10,
  total = 0,
}: AdvancedDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / limit),
  });

  const totalPages = Math.ceil(total / limit);
  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Header Section with Filters and Actions */}
      <div className="flex items-center justify-between gap-4">
        {/* Filters Section */}
        <div className="flex items-center gap-4 flex-1 flex-wrap">
          {filters.map((filter, index) => (
            <div key={`${filter.name}-${index}`} className="flex flex-col gap-1.5">
              {filter.label && (
                <label className="text-sm font-medium text-foreground">
                  {filter.label}
                </label>
              )}
              
              {filter.type === "input" && (
                <Input
                  placeholder={filter.placeholder || "Search..."}
                  onChange={(event) => filter.onChange(event.target.value)}
                  className={filter.className || "h-10 bg-background"}
                />
              )}
              
              {filter.type === "select" && (
                <Select onValueChange={filter.onChange}>
                  <SelectTrigger className={filter.className || "h-10 w-[180px] bg-background"}>
                    <SelectValue placeholder={filter.placeholder || "Select..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons Section */}
        {actionButtons.length > 0 && (
          <div className="flex items-center gap-2">
            {actionButtons.map((button, index) => (
              <Button
                key={`${button.label}-${index}`}
                onClick={button.onClick}
                variant={button.variant || "default"}
                className={button.className}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-border"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="h-12 px-6 text-sm font-semibold text-foreground bg-muted/15"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-4 text-xs">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex items-center justify-between px-2">
        {/* Left: Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Rows per page:
          </span>
          <Select
            value={`${limit}`}
            onValueChange={(value) => {
              onLimitChange?.(Number(value));
            }}
          >
            <SelectTrigger className="h-9 w-[75px] bg-card">
              <SelectValue placeholder={limit} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-4">
            Showing {startRecord} to {endRecord} of {total} entries
          </span>
        </div>

        {/* Right: Page navigation */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Page {page} of {totalPages || 1}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card"
              onClick={() => onPageChange?.(1)}
              disabled={page <= 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-card"
              onClick={() => onPageChange?.(totalPages)}
              disabled={page >= totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
