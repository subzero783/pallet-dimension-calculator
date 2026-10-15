// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import CutListTable from "../CutListTable";
import { ToastProvider } from "@/context/ToastContext";
import { calculatePallet } from "@/lib/palletEngine";

describe("CutListTable Component", () => {
  it("renders simplified cut sheet items and metrics correctly", () => {
    const calcResult = calculatePallet({
      productLength: 46,
      productWidth: 38,
      productHeight: 30,
      productWeight: 800,
      middleBoardCount: 1,
    });

    render(
      <ToastProvider>
        <CutListTable
          jobId="JOB-99123"
          productName="Turbine Housing"
          customer="Pacific Maritime / GE Aviation"
          calculationResult={calcResult}
          palletDimensions={calcResult.palletDimensions}
        />
      </ToastProvider>
    );

    expect(screen.getByText(/Itemized Wood Cut List/i)).toBeInTheDocument();
    expect(screen.getByText("Top Boards")).toBeInTheDocument();
    expect(screen.getByText("Middle Wood Pieces / Runners")).toBeInTheDocument();
    expect(screen.getByText("Bottom Boards")).toBeInTheDocument();
    expect(screen.getByText(/Total Board Feet/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated Tare Weight/i)).toBeInTheDocument();
    expect(screen.getByText(/Fasteners Required/i)).toBeInTheDocument();
  });
});
