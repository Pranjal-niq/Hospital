import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

const dataDir = path.join(process.cwd(), "data");
const filePath = path.join(dataDir, "bookings.xlsx");

async function ensureWorkbook(): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
  } else {
    const sheet = workbook.addWorksheet("Bookings");

    sheet.addRow([
      "Booking No",
      "Doctor",
      "Patient Name",
      "Phone",
      "Email",
      "Appointment Time",
      "Created At",
    ]);

    await workbook.xlsx.writeFile(filePath);
  }

  return workbook;
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { doctor, name, phone, email, datetime } = data;

    if (!doctor || !name || !phone) {
      return NextResponse.json(
        { error: "doctor, name and phone are required" },
        { status: 400 },
      );
    }

    const workbook = await ensureWorkbook();

    let sheet = workbook.getWorksheet("Bookings");

    if (!sheet) {
      sheet = workbook.addWorksheet("Bookings");

      sheet.addRow([
        "Booking No",
        "Doctor",
        "Patient Name",
        "Phone",
        "Email",
        "Appointment Time",
        "Created At",
      ]);
    }

    const bookingNo = `APT-${nanoid(6).toUpperCase()}`;

    const createdAt = new Date().toISOString();

    sheet.addRow([
      bookingNo,
      doctor,
      name,
      phone,
      email || "",
      datetime || "",
      createdAt,
    ]);

    await workbook.xlsx.writeFile(filePath);

    return NextResponse.json({ bookingNo });
  } catch (err) {
    console.error("booking API error", err);

    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 },
    );
  }
}
