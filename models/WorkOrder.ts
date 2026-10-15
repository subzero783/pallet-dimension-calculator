import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICutListItem {
  name: string;
  quantity: number;
  nominalDimension: string;
  actualDimension: string;
  thickness: number;
  width: number;
  length: number;
  boardFeet: number;
}

export interface ICalculationResult {
  palletDimensions: {
    length: number;
    width: number;
    height: number;
  };
  cutList: ICutListItem[];
  totalBoardFeet: number;
  estimatedTareWeight: number;
  maxSafeLoad: number;
  fastenersCount: number;
  topDeckboardCount: number;
  bottomDeckboardCount: number;
  stringerCount: number;
  actualSpacing: number;
  middleBoardCount?: number;
  boardGap?: number;
}

export interface IWorkOrder extends Document {
  workOrderId: string;
  jobId?: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const CutListItemSchema = new Schema<ICutListItem>({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  nominalDimension: { type: String, default: "" },
  actualDimension: { type: String, required: true },
  thickness: { type: Number, required: true },
  width: { type: Number, required: true },
  length: { type: Number, required: true },
  boardFeet: { type: Number, required: true },
});

const WorkOrderSchema = new Schema<IWorkOrder>(
  {
    workOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    jobId: {
      type: String,
      trim: true,
      index: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    employeeFirstName: {
      type: String,
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: true,
      trim: true,
    },
    cadDimensions: {
      length: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      weight: { type: Number, required: true },
    },
    palletConfig: {
      palletStyle: { type: String, required: true, default: "2-Way Stringer (Flush)" },
      lengthAllowance: { type: Number, required: true, default: 4.0 },
      widthAllowance: { type: Number, required: true, default: 4.0 },
      deckboardNominal: { type: String, required: true, default: "1x4" },
      stringerNominal: { type: String, required: true, default: "2x4" },
      targetMaxGap: { type: Number, required: true, default: 3.0 },
      boardGap: { type: Number, default: 3.0 },
      middleBoardCount: { type: Number, default: 1 },
    },
    calculationResult: {
      palletDimensions: {
        length: { type: Number, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
      },
      cutList: [CutListItemSchema],
      totalBoardFeet: { type: Number, required: true },
      estimatedTareWeight: { type: Number, required: true },
      maxSafeLoad: { type: Number, required: true },
      fastenersCount: { type: Number, required: true },
      topDeckboardCount: { type: Number, required: true },
      bottomDeckboardCount: { type: Number, required: true },
      stringerCount: { type: Number, required: true },
      actualSpacing: { type: Number, required: true },
    },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["DRAFT", "READY_FOR_BUILD", "BUILT", "SHIPPED"],
      default: "READY_FOR_BUILD",
    },
    createdBy: {
      type: String,
      required: true,
      default: "System",
    },
  },
  {
    timestamps: true,
  }
);

export const WorkOrder: Model<IWorkOrder> =
  mongoose.models.WorkOrder || mongoose.model<IWorkOrder>("WorkOrder", WorkOrderSchema);

export default WorkOrder;
