import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { calculatePallet } from "@/lib/palletEngine";
import { ICalculationResult } from "@/models/WorkOrder";

export interface CalculatorState {
  jobId: string;
  workOrderId: string;
  employeeId: string;
  employeeFirstName: string;
  productName: string;
  customer: string;
  cadDimensions: {
    width: number;
    length: number;
    height: number;
    weight: number;
  };
  palletConfig: {
    palletStyle: "2-Way Stringer (Flush)" | "2-Way Stringer (Overhang)" | "4-Way Notched Stringer" | "Heavy-Duty Skid";
    lengthAllowance: number;
    widthAllowance: number;
    deckboardNominal: "1x4" | "1x6";
    stringerNominal: "2x4" | "4x4";
    targetMaxGap: number;
    boardGap: number;
    middleBoardCount: 1 | 2;
    bottomBoardCount: number;
  };
  calculationResult: ICalculationResult;
  notes: string;
  viewMode: "3d" | "top" | "side";
  isCalculating: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  errorMessage: string | null;
}

const initialDimensions = {
  width: 38.0,
  length: 46.0,
  height: 32.0,
  weight: 850,
};

const initialPalletConfig: CalculatorState["palletConfig"] = {
  palletStyle: "2-Way Stringer (Flush)",
  lengthAllowance: 2.0,
  widthAllowance: 2.0,
  deckboardNominal: "1x6",
  stringerNominal: "2x4",
  targetMaxGap: 3.0,
  boardGap: 3.0,
  middleBoardCount: 1,
  bottomBoardCount: 2,
};

const initialResult = calculatePallet({
  productLength: initialDimensions.length,
  productWidth: initialDimensions.width,
  productHeight: initialDimensions.height,
  productWeight: initialDimensions.weight,
  palletStyle: initialPalletConfig.palletStyle,
  lengthAllowance: initialPalletConfig.lengthAllowance,
  widthAllowance: initialPalletConfig.widthAllowance,
  deckboardNominal: initialPalletConfig.deckboardNominal,
  stringerNominal: initialPalletConfig.stringerNominal,
  targetMaxGap: initialPalletConfig.targetMaxGap,
  boardGap: initialPalletConfig.boardGap,
  middleBoardCount: initialPalletConfig.middleBoardCount,
  bottomBoardCount: initialPalletConfig.bottomBoardCount,
});

// Clear initial text input values (empty strings with placeholders only)
const initialState: CalculatorState = {
  jobId: "",
  workOrderId: "",
  employeeId: "",
  employeeFirstName: "",
  productName: "",
  customer: "",
  cadDimensions: initialDimensions,
  palletConfig: initialPalletConfig,
  calculationResult: initialResult,
  notes: "",
  viewMode: "3d",
  isCalculating: false,
  saveStatus: "idle",
  errorMessage: null,
};

function performCalculation(state: CalculatorState) {
  state.calculationResult = calculatePallet({
    productLength: state.cadDimensions.length,
    productWidth: state.cadDimensions.width,
    productHeight: state.cadDimensions.height,
    productWeight: state.cadDimensions.weight,
    palletStyle: state.palletConfig.palletStyle,
    lengthAllowance: state.palletConfig.lengthAllowance,
    widthAllowance: state.palletConfig.widthAllowance,
    deckboardNominal: state.palletConfig.deckboardNominal,
    stringerNominal: state.palletConfig.stringerNominal,
    targetMaxGap: state.palletConfig.targetMaxGap,
    boardGap: state.palletConfig.boardGap,
    middleBoardCount: state.palletConfig.middleBoardCount,
    bottomBoardCount: state.palletConfig.bottomBoardCount,
  });
}

export const calculatorSlice = createSlice({
  name: "calculator",
  initialState,
  reducers: {
    setCadDimensions: (
      state,
      action: PayloadAction<Partial<CalculatorState["cadDimensions"]>>
    ) => {
      state.cadDimensions = { ...state.cadDimensions, ...action.payload };
      performCalculation(state);
    },
    setPalletConfig: (
      state,
      action: PayloadAction<Partial<CalculatorState["palletConfig"]>>
    ) => {
      state.palletConfig = { ...state.palletConfig, ...action.payload };
      if (action.payload.boardGap !== undefined) {
        state.palletConfig.targetMaxGap = action.payload.boardGap;
      }
      performCalculation(state);
    },
    setOrderMetadata: (
      state,
      action: PayloadAction<{
        jobId?: string;
        workOrderId?: string;
        employeeId?: string;
        employeeFirstName?: string;
        productName?: string;
        customer?: string;
        notes?: string;
      }>
    ) => {
      if (action.payload.jobId !== undefined) {
        state.jobId = action.payload.jobId;
        state.workOrderId = action.payload.jobId;
      }
      if (action.payload.workOrderId !== undefined) {
        state.workOrderId = action.payload.workOrderId;
        if (!state.jobId) state.jobId = action.payload.workOrderId;
      }
      if (action.payload.employeeId !== undefined) state.employeeId = action.payload.employeeId;
      if (action.payload.employeeFirstName !== undefined) state.employeeFirstName = action.payload.employeeFirstName;
      if (action.payload.productName !== undefined) state.productName = action.payload.productName;
      if (action.payload.customer !== undefined) state.customer = action.payload.customer;
      if (action.payload.notes !== undefined) state.notes = action.payload.notes;
    },
    setViewMode: (state, action: PayloadAction<"3d" | "top" | "side">) => {
      state.viewMode = action.payload;
    },
    loadPreset: (
      state,
      action: PayloadAction<{
        name: string;
        customer: string;
        dimensions: { length: number; width: number; height: number; weight: number };
        style?: CalculatorState["palletConfig"]["palletStyle"];
        deckboard?: "1x4" | "1x6";
        stringer?: "2x4" | "4x4";
        middleBoardCount?: 1 | 2;
        bottomBoardCount?: number;
        boardGap?: number;
      }>
    ) => {
      state.jobId = "JOB-" + Math.floor(10000 + Math.random() * 90000);
      state.workOrderId = state.jobId;
      state.productName = action.payload.name;
      state.customer = action.payload.customer;
      state.cadDimensions = {
        width: action.payload.dimensions.width,
        length: action.payload.dimensions.length,
        height: action.payload.dimensions.height,
        weight: action.payload.dimensions.weight,
      };
      if (action.payload.style) state.palletConfig.palletStyle = action.payload.style;
      if (action.payload.deckboard) state.palletConfig.deckboardNominal = action.payload.deckboard;
      if (action.payload.stringer) state.palletConfig.stringerNominal = action.payload.stringer;
      if (action.payload.middleBoardCount) state.palletConfig.middleBoardCount = action.payload.middleBoardCount;
      if (action.payload.bottomBoardCount) state.palletConfig.bottomBoardCount = action.payload.bottomBoardCount;
      if (action.payload.boardGap !== undefined) {
        state.palletConfig.boardGap = action.payload.boardGap;
        state.palletConfig.targetMaxGap = action.payload.boardGap;
      }
      performCalculation(state);
    },
    loadExistingWorkOrder: (state, action: PayloadAction<any>) => {
      const wo = action.payload;
      state.jobId = wo.jobId || wo.workOrderId || "";
      state.workOrderId = wo.workOrderId || wo.jobId || "";
      state.employeeId = wo.employeeId || "";
      state.employeeFirstName = wo.employeeFirstName || "";
      state.productName = wo.productName || "";
      state.customer = wo.customer || "";
      if (wo.cadDimensions) {
        state.cadDimensions = {
          width: wo.cadDimensions.width,
          length: wo.cadDimensions.length,
          height: wo.cadDimensions.height,
          weight: wo.cadDimensions.weight,
        };
      }
      if (wo.palletConfig) {
        state.palletConfig = {
          ...state.palletConfig,
          ...wo.palletConfig,
          boardGap: wo.palletConfig.boardGap ?? wo.palletConfig.targetMaxGap ?? 3.0,
          middleBoardCount: wo.palletConfig.middleBoardCount ?? 1,
          bottomBoardCount: wo.palletConfig.bottomBoardCount ?? 2,
        };
      }
      state.notes = wo.notes || "";
      if (wo.calculationResult) {
        state.calculationResult = wo.calculationResult;
      } else {
        performCalculation(state);
      }
    },
    setSaveStatus: (state, action: PayloadAction<CalculatorState["saveStatus"]>) => {
      state.saveStatus = action.payload;
    },
    resetCalculator: (state) => {
      state.jobId = "";
      state.workOrderId = "";
      state.employeeId = "";
      state.employeeFirstName = "";
      state.productName = "";
      state.customer = "";
      state.notes = "";
      state.cadDimensions = initialDimensions;
      state.palletConfig = initialPalletConfig;
      performCalculation(state);
    },
  },
});

export const {
  setCadDimensions,
  setPalletConfig,
  setOrderMetadata,
  setViewMode,
  loadPreset,
  loadExistingWorkOrder,
  setSaveStatus,
  resetCalculator,
} = calculatorSlice.actions;

export default calculatorSlice.reducer;
