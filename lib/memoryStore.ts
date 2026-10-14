import { calculatePallet } from "./palletEngine";

declare global {
  // eslint-disable-next-line no-var
  var __palletWorkOrders: any[] | undefined;
}

const seedOrders = [
  {
    _id: "seed-wo-1",
    workOrderId: "WO-84920",
    productName: "CNC 5-Axis Spindle Assembly",
    customer: "Boeing Defense & Space",
    cadDimensions: { length: 58, width: 44, height: 36, weight: 1850 },
    palletConfig: {
      palletStyle: "2-Way Stringer (Flush)",
      lengthAllowance: 2.0,
      widthAllowance: 2.0,
      deckboardNominal: "1x6",
      stringerNominal: "2x4",
      targetMaxGap: 2.8,
    },
    calculationResult: calculatePallet({
      productLength: 58,
      productWidth: 44,
      productHeight: 36,
      productWeight: 1850,
      deckboardNominal: "1x6",
    }),
    notes: "Requires protective heavy poly barrier and steel banding.",
    status: "READY_FOR_BUILD",
    createdBy: "Dave Miller (Shipping Clerk)",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-wo-2",
    workOrderId: "WO-41092",
    productName: "Standard Freight Electronics Rack",
    customer: "FedEx Freight / Global Logistics",
    cadDimensions: { length: 46, width: 38, height: 32, weight: 950 },
    palletConfig: {
      palletStyle: "2-Way Stringer (Flush)",
      lengthAllowance: 2.0,
      widthAllowance: 2.0,
      deckboardNominal: "1x4",
      stringerNominal: "2x4",
      targetMaxGap: 3.0,
    },
    calculationResult: calculatePallet({
      productLength: 46,
      productWidth: 38,
      productHeight: 32,
      productWeight: 950,
    }),
    notes: "Standard high-bay racking dimensions.",
    status: "BUILT",
    createdBy: "Sarah Connor (Plant Supervisor)",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "seed-wo-3",
    workOrderId: "WO-77218",
    productName: "Hydraulic Power Unit Skid",
    customer: "Caterpillar Industrial",
    cadDimensions: { length: 82, width: 52, height: 48, weight: 3400 },
    palletConfig: {
      palletStyle: "Heavy-Duty Skid",
      lengthAllowance: 2.0,
      widthAllowance: 2.0,
      deckboardNominal: "1x6",
      stringerNominal: "4x4",
      targetMaxGap: 3.0,
    },
    calculationResult: calculatePallet({
      productLength: 82,
      productWidth: 52,
      productHeight: 48,
      productWeight: 3400,
      palletStyle: "Heavy-Duty Skid",
      deckboardNominal: "1x6",
      stringerNominal: "4x4",
    }),
    notes: "Heavy machinery skids for flatbed transport.",
    status: "SHIPPED",
    createdBy: "Alex Mercer (Operations Admin)",
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
    (o) => o._id === id || o.workOrderId === id
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
    (o) => o._id !== id && o.workOrderId !== id
  );
  return globalThis.__palletWorkOrders.length < before;
}
