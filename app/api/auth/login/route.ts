import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import User, { hashPassword } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

const DEMO_USERS: Record<string, { name: string; role: "shipping_clerk" | "supervisor" | "admin" }> = {
  clerk: { name: "Dave Miller (Shipping Clerk)", role: "shipping_clerk" },
  supervisor: { name: "Sarah Connor (Plant Supervisor)", role: "supervisor" },
  admin: { name: "Alex Mercer (Operations Admin)", role: "admin" },
};

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Environment-variable based supervisor login
    const supervisorUsername = (process.env.SUPERVISOR_USERNAME || "oliver").toLowerCase().trim();
    const supervisorPassword = process.env.SUPERVISOR_PASSWORD || "supervisor2026!";
    const supervisorName = process.env.SUPERVISOR_NAME || "Oliver";

    if (normalizedUsername === supervisorUsername && password === supervisorPassword) {
      const tokenPayload = {
        userId: "supervisor-oliver",
        username: supervisorUsername,
        name: supervisorName,
        role: "supervisor",
      };

      const token = await signToken(tokenPayload);
      await setAuthCookie(token);

      return NextResponse.json({
        message: "Login successful",
        user: tokenPayload,
      });
    }

    // Fast-path: Auto-authenticate demo accounts immediately
    if (DEMO_USERS[normalizedUsername] && password === "pallet2026!") {
      const demoConfig = DEMO_USERS[normalizedUsername];
      const tokenPayload = {
        userId: `demo-${normalizedUsername}`,
        username: normalizedUsername,
        name: demoConfig.name,
        role: demoConfig.role,
      };

      const token = await signToken(tokenPayload);
      await setAuthCookie(token);

      return NextResponse.json({
        message: "Login successful",
        user: tokenPayload,
      });
    }

    // Try MongoDB connection for registered users
    try {
      await connectToDatabase();
      const user = await User.findOne({ username: normalizedUsername });

      if (!user) {
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 }
        );
      }

      const isMatch = await user.verifyPassword(password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Invalid username or password" },
          { status: 401 }
        );
      }

      const tokenPayload = {
        userId: user._id.toString(),
        username: user.username,
        name: user.name,
        role: user.role,
      };

      const token = await signToken(tokenPayload);
      await setAuthCookie(token);

      return NextResponse.json({
        message: "Login successful",
        user: tokenPayload,
      });
    } catch (dbErr: any) {
      console.warn("MongoDB unavailable, checking credentials:", dbErr.message);
      return NextResponse.json(
        { error: "Database offline. Please use one of the one-click demo accounts." },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log in" },
      { status: 500 }
    );
  }
}
