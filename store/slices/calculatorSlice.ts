import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { calculatePallet, PalletInputParams } from "@/lib/palletEngine";
import { ICalculationResult } from "@/models/WorkOrder";

export interface CalculatorState {
  workOrderId: string;
  productName: string;
  customer: string;
  cadDimensions: {
    length: number;
    width: number;
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
  };
  calculationResult: ICalculationResult;
  notes: string;
  viewMode: "3d" | "top" | "side";
  isCalculating: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  errorMessage: string | null;
}

const initialDimensions = {
  length: 46.0,
  width: 38.0,
  height: 32.0,
  weight: 850,
};

const initialPalletConfig: CalculatorState["palletConfig"] = {
  palletStyle: "2-Way Stringer (Flush)",
  lengthAllowance: 2.0,
  widthAllowance: 2.0,
  deckboardNominal: "1x4",
  stringerNominal: "2x4",
  targetMaxGap: 3.0,
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
});

const initialState: CalculatorState = {
  workOrderId: "WO-" + Math.floor(10000 + Math.random() * 90000),
  productName: "Industrial Gearbox & Motor Assembly",
  customer: "Titan Robotics Systems",
  cadDimensions: initialDimensions,
  palletConfig: initialPalletConfig,
  calculationResult: initialResult,
  notes: "Standard warehouse floor & high-bay rack storage. Band with 2x polyester strapping.",
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
      performCalculation(state);
    },
    setOrderMetadata: (
      state,
      action: PayloadAction<{
        workOrderId?: string;
        productName?: string;
        customer?: string;
        notes?: string;
      }>
    ) => {
      if (action.payload.workOrderId !== undefined) state.workOrderId = action.payload.workOrderId;
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
      }>
    ) => {
      state.workOrderId = "WO-" + Math.floor(10000 + Math.random() * 90000);
      state.productName = action.payload.name;
      state.customer = action.payload.customer;
      state.cadDimensions = action.payload.dimensions;
      if (action.payload.style) state.palletConfig.palletStyle = action.payload.style;
      if (action.payload.deckboard) state.palletConfig.deckboardNominal = action.payload.deckboard;
      if (action.payload.stringer) state.palletConfig.stringerNominal = action.payload.stringer;
      performCalculation(state);
    },
    loadExistingWorkOrder: (state, action: PayloadAction<any>) => {
      const wo = action.payload;
      state.workOrderId = wo.workOrderId;
      state.productName = wo.productName;
      state.customer = wo.customer;
      state.cadDimensions = wo.cadDimensions;
      state.palletConfig = wo.palletConfig;
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
      state.workOrderId = "WO-" + Math.floor(10000 + Math.random() * 90000);
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
