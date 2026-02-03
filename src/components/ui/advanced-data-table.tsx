"use client";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
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
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AdvancedDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onAdd?: () => void;
  onSearch?: (value: string) => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRowClick?: (row: TData) => void;
  page?: number;
  limit?: number;
  total?: number;
  hideRowsPerPage?: boolean;
  cellClassName?: string;
  headerClassName?: string;
  searchPlaceholder?: string;
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onAdd,
  onSearch,
  onPageChange,
  onLimitChange,
  onRowClick,
  page = 1,
  limit = 10,
  total = 0,
  hideRowsPerPage = true,
  cellClassName,
  headerClassName,
  searchPlaceholder = "Search...",
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
    <div className="space-y-2">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {onSearch && (
            <Input
              placeholder={searchPlaceholder}
              onChange={(event) => onSearch(event.target.value)}
              className="max-w-sm h-10 bg-background"
            />
          )}
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="ml-auto">
            Add New
          </Button>
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
                      className={cn("h-8 px-4 text-sm font-semibold text-foreground bg-muted/30", headerClassName)}
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
                  className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => {
                    if (onRowClick) {
                      // row.original is the typed row model value
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                      onRowClick(row.original as TData);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("px-4 py-[2px] text-sm", cellClassName)}>
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
      {total > 0 && (
        <div className="flex items-center justify-between px-2">
          {/* Left: Rows per page */}
          <div className="flex items-center gap-2">
            {!hideRowsPerPage && (
              <>
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
              </>
            )}
            <span className="text-sm text-muted-foreground">
              Showing {startRecord} to {endRecord} of {total} entries
            </span>
          </div>

          {/* Right: Page navigation with numbers */}
          <div className="flex items-center gap-1">
            {/* Previous button */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-card"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {(() => {
              const pages: (number | string)[] = [];
              const maxVisible = 5;
              
              if (totalPages <= maxVisible) {
                // Show all pages if total is small
                for (let i = 1; i <= totalPages; i++) {
                  pages.push(i);
                }
              } else {
                // Always show first page
                pages.push(1);
                
                if (page > 3) {
                  pages.push('...');
                }
                
                // Show pages around current
                const start = Math.max(2, page - 1);
                const end = Math.min(totalPages - 1, page + 1);
                
                for (let i = start; i <= end; i++) {
                  if (!pages.includes(i)) {
                    pages.push(i);
                  }
                }
                
                if (page < totalPages - 2) {
                  pages.push('...');
                }
                
                // Always show last page
                if (!pages.includes(totalPages)) {
                  pages.push(totalPages);
                }
              }
              
              return pages.map((p, idx) => (
                typeof p === 'number' ? (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
                    size="icon"
                    className={`h-8 w-8 ${page === p ? 'bg-primary text-primary-foreground' : 'bg-card'}`}
                    onClick={() => onPageChange?.(p)}
                  >
                    {p}
                  </Button>
                ) : (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    {p}
                  </span>
                )
              ));
            })()}

            {/* Next button */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-card"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
