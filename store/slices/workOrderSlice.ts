import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { ICalculationResult } from "@/models/WorkOrder";

export interface SerializedWorkOrder {
  _id?: string;
  jobId?: string;
  workOrderId: string;
  employeeId?: string;
  employeeFirstName?: string;
  productName: string;
  customer: string;
  cadDimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  palletConfig: {
    palletStyle: string;
    lengthAllowance: number;
    widthAllowance: number;
    deckboardNominal: string;
    stringerNominal: string;
    targetMaxGap: number;
    boardGap?: number;
    middleBoardCount?: number;
  };
  calculationResult: ICalculationResult;
  notes?: string;
  status: "DRAFT" | "READY_FOR_BUILD" | "BUILT" | "SHIPPED";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderState {
  items: SerializedWorkOrder[];
  selectedOrder: SerializedWorkOrder | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
}

const initialState: WorkOrderState = {
  items: [],
  selectedOrder: null,
  isLoading: false,
  error: null,
  searchQuery: "",
  statusFilter: "ALL",
};

export const fetchWorkOrders = createAsyncThunk<
  SerializedWorkOrder[],
  { query?: string; status?: string } | void
>(
  "workOrders/fetchAll",
  async (args) => {
    const query = args?.query || "";
    const status = args?.status || "ALL";
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status && status !== "ALL") params.set("status", status);

    const res = await fetch(`/api/work-orders?${params.toString()}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to fetch work orders");
    }
    const data = await res.json();
    return data.workOrders as SerializedWorkOrder[];
  }
);

export const saveWorkOrder = createAsyncThunk(
  "workOrders/save",
  async (orderData: Partial<SerializedWorkOrder>) => {
    const res = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save work order");
    }
    const data = await res.json();
    return data.workOrder as SerializedWorkOrder;
  }
);

export const deleteWorkOrder = createAsyncThunk(
  "workOrders/delete",
  async (id: string) => {
    const res = await fetch(`/api/work-orders/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete work order");
    }
    return id;
  }
);

export const updateWorkOrderStatus = createAsyncThunk(
  "workOrders/updateStatus",
  async ({ id, status }: { id: string; status: string }) => {
    const res = await fetch(`/api/work-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update work order status");
    }
    const data = await res.json();
    return data.workOrder as SerializedWorkOrder;
  }
);

export const workOrderSlice = createSlice({
  name: "workOrders",
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setSelectedOrder: (state, action: PayloadAction<SerializedWorkOrder | null>) => {
      state.selectedOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchWorkOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load orders";
      })
      // Save
      .addCase(saveWorkOrder.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Delete
      .addCase(deleteWorkOrder.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (o) => String(o._id) !== action.payload && o.workOrderId !== action.payload
        );
      })
      // Update Status
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (o) => String(o._id) === String(action.payload._id) || o.workOrderId === action.payload.workOrderId
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { setSearchQuery, setStatusFilter, setSelectedOrder } =
  workOrderSlice.actions;

export default workOrderSlice.reducer;
