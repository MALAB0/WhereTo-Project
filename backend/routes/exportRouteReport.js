import express from "express";
import ExcelJS from "exceljs";
import Report from "../models/report.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const reports = await Report.find();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Reports");

    worksheet.columns = [
      { header: "Report ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Status", key: "status", width: 15 },
      { header: "Date Created", key: "createdAt", width: 20 },
    ];

    reports.forEach((report) => worksheet.addRow(report));

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=reports.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating Excel file");
  }
});

export default router;