import { calculatePallet } from "./palletEngine";

declare global {
  // eslint-disable-next-line no-var
  var __palletWorkOrders: any[] | undefined;
}

const seedOrders = [
  {
    _id: "seed-wo-1",
    jobId: "JOB-84920",
    workOrderId: "JOB-84920",
    employeeId: "EMP-104",
    employeeFirstName: "Dave",
    productName: "CNC 5-Axis Spindle Assembly",
    customer: "Pacific Maritime / Boeing Defense",
    cadDimensions: { length: 58, width: 44, height: 36, weight: 1850 },
    palletConfig: {
      palletStyle: "2-Way Stringer (Flush)",
      lengthAllowance: 4.0,
      widthAllowance: 4.0,
      deckboardNominal: "1x6",
      stringerNominal: "2x4",
      targetMaxGap: 3.0,
      boardGap: 3.0,
      middleBoardCount: 2,
    },
    calculationResult: calculatePallet({
      productLength: 58,
      productWidth: 44,
      productHeight: 36,
      productWeight: 1850,
      deckboardNominal: "1x6",
      middleBoardCount: 2,
      boardGap: 3.0,
      lengthAllowance: 4.0,
      widthAllowance: 4.0,
    }),
    notes: "Heavy locker/spindle unit: 2 middle pieces selected. Band with polyester strapping.",
    status: "READY_FOR_BUILD",
    createdBy: "Dave (EMP-104)",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-wo-2",
    jobId: "JOB-41092",
    workOrderId: "JOB-41092",
    employeeId: "EMP-208",
    employeeFirstName: "Sarah",
    productName: "Marine Cabin Aluminum Chairs",
    customer: "Pacific Maritime Industries",
    cadDimensions: { length: 46, width: 38, height: 32, weight: 450 },
    palletConfig: {
      palletStyle: "2-Way Stringer (Flush)",
      lengthAllowance: 4.0,
      widthAllowance: 4.0,
      deckboardNominal: "1x4",
      stringerNominal: "2x4",
      targetMaxGap: 3.0,
      boardGap: 3.0,
      middleBoardCount: 1,
    },
    calculationResult: calculatePallet({
      productLength: 46,
      productWidth: 38,
      productHeight: 32,
      productWeight: 450,
      middleBoardCount: 1,
      boardGap: 3.0,
      lengthAllowance: 4.0,
      widthAllowance: 4.0,
    }),
    notes: "Light item (chairs): 1 middle wood piece. Standard warehouse clearance.",
    status: "BUILT",
    createdBy: "Sarah (EMP-208)",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-wo-3",
    jobId: "JOB-77218",
    workOrderId: "JOB-77218",
    employeeId: "EMP-312",
    employeeFirstName: "Alex",
    productName: "Watertight Bulkhead Door Lockers",
    customer: "Pacific Maritime / US Navy",
    cadDimensions: { length: 82, width: 52, height: 48, weight: 3400 },
    palletConfig: {
      palletStyle: "2-Way Stringer (Flush)",
      lengthAllowance: 4.0,
      widthAllowance: 4.0,
      deckboardNominal: "1x6",
      stringerNominal: "4x4",
      targetMaxGap: 4.0,
      boardGap: 4.0,
      middleBoardCount: 2,
    },
    calculationResult: calculatePallet({
      productLength: 82,
      productWidth: 52,
      productHeight: 48,
      productWeight: 3400,
      deckboardNominal: "1x6",
      stringerNominal: "4x4",
      middleBoardCount: 2,
      boardGap: 4.0,
      lengthAllowance: 4.0,
      widthAllowance: 4.0,
    }),
    notes: "Heavy locker enclosure: 2 middle pieces. High-tensile steel banding required.",
    status: "SHIPPED",
    createdBy: "Alex (EMP-312)",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

if (!globalThis.__palletWorkOrders) {
  globalThis.__palletWorkOrders = [...seedOrders];
}

export function getMemoryOrders() {
  return globalThis.__palletWorkOrders || [];
}

export function addMemoryOrder(order: any) {
  if (!globalThis.__palletWorkOrders) {
    globalThis.__palletWorkOrders = [...seedOrders];
  }
  globalThis.__palletWorkOrders.unshift(order);
  return order;
}

export function updateMemoryOrder(id: string, updates: any) {
  if (!globalThis.__palletWorkOrders) return null;
  const index = globalThis.__palletWorkOrders.findIndex(
    (o) => o._id === id || o.workOrderId === id || o.jobId === id
  );
  if (index === -1) return null;
  globalThis.__palletWorkOrders[index] = {
    ...globalThis.__palletWorkOrders[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return globalThis.__palletWorkOrders[index];
}

export function deleteMemoryOrder(id: string) {
  if (!globalThis.__palletWorkOrders) return false;
  const before = globalThis.__palletWorkOrders.length;
  globalThis.__palletWorkOrders = globalThis.__palletWorkOrders.filter(
    (o) => o._id !== id && o.workOrderId !== id && o.jobId !== id
  );
  return globalThis.__palletWorkOrders.length < before;
}
