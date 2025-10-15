"use client";
import React from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { patientColumns } from "../pages/patientColumns";
import type { Patient } from "../types/patient.types";

type Props = {
  data: Patient[];
  isLoading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSearch?: (value: string) => void;
  onAdd?: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
  onRowClick?: (row: Patient) => void;
};

export function DataTableWIthFilter(props: Props) {
  const {
    data,
    isLoading,
    page,
    limit,
    total,
    onPageChange,
    onLimitChange,
    onSearch,
    onAdd,
    onEdit,
    onDelete,
    onRowClick,
  } = props;

  const columns: ColumnDef<Patient, unknown>[] = React.useMemo(
    () => patientColumns(onEdit, onDelete),
    [onEdit, onDelete]
  );

  return (
    <AdvancedDataTable<Patient, unknown>
      columns={columns}
      data={data}
      isLoading={isLoading}
      page={page}
      limit={limit}
      total={total}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
      onSearch={onSearch}
      onAdd={onAdd}
      onRowClick={onRowClick}
    />
  );
}

export default DataTableWIthFilter;
