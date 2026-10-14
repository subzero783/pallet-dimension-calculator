import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/database";
import User, { hashPassword } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, name, password, role } = await req.json();

    if (!username || !name || !password) {
      return NextResponse.json(
        { error: "Username, name, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ username: username.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username: username.toLowerCase().trim(),
      name: name.trim(),
      password: hashedPassword,
      role: role || "shipping_clerk",
    });

    const tokenPayload = {
      userId: newUser._id.toString(),
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
    };

    const token = await signToken(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: tokenPayload,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
