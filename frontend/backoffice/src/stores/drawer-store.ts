import { create } from "zustand";
import type { HierarchyIds } from "@/features/partners/hierarchy";
import {
  EntityLayout,
  type Account,
  type Customer,
  type Partner,
  type Wallet,
} from "@/types/partners";

export type DrawerType =
  | "detail"
  | "edit"
  | "download"
  | "config"
  | "vaults"
  | "cards";

export type DrawerEntity = Partner | Customer | Wallet | Account;

interface DrawerState {
  open: boolean;
  type: DrawerType | null;
  layout: EntityLayout;
  entity: DrawerEntity | null;
  context: HierarchyIds;
  onRefresh?: () => void;
  openDrawer: (params: {
    type: DrawerType;
    layout: EntityLayout;
    entity: DrawerEntity;
    context?: HierarchyIds;
    onRefresh?: () => void;
  }) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  open: false,
  type: null,
  layout: EntityLayout.Partners,
  entity: null,
  context: {},
  onRefresh: undefined,
  openDrawer: ({ type, layout, entity, context = {}, onRefresh }) =>
    set({
      open: true,
      type,
      layout,
      entity,
      context,
      onRefresh,
    }),
  closeDrawer: () =>
    set({
      open: false,
      type: null,
      entity: null,
      onRefresh: undefined,
    }),
}));
