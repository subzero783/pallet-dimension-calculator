// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import CutListTable from "../CutListTable";
import { ToastProvider } from "@/context/ToastContext";
import { calculatePallet } from "@/lib/palletEngine";

describe("CutListTable Component", () => {
  it("renders cut sheet items and metrics correctly", () => {
    const calcResult = calculatePallet({
      productLength: 46,
      productWidth: 38,
      productHeight: 30,
      productWeight: 800,
    });

    render(
      <ToastProvider>
        <CutListTable
          workOrderId="WO-99123"
          productName="Turbine Housing"
          customer="GE Aviation"
          calculationResult={calcResult}
          palletDimensions={calcResult.palletDimensions}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/Itemized Wood Cut List/i)).toBeInTheDocument();
    expect(screen.getByText("Stringers")).toBeInTheDocument();
    expect(screen.getByText("Top Lead Deckboards")).toBeInTheDocument();
    expect(screen.getByText(/Total Board Feet/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Tare Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Fasteners Required/i)).toBeInTheDocument();
  });
});
