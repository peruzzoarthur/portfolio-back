import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function rawSql() {
  try {
    const rawSql = fs.readFileSync(
      "/home/ozzurep/coldLab/dump_test/railway_dump.sql",
      "utf8",
    );

    // Remove comment lines but preserve newlines in content
    const sqlReducedToStatements = rawSql
      .split("\n")
      .filter((line) => !line.startsWith("--")) // remove comments-only lines
      .join("\n");

    const sqlStatements = splitStringByNotQuotedSemicolon(sqlReducedToStatements);
    
    for (const sql of sqlStatements) {
      if (sql.trim()) {
        // Process the SQL statement to properly handle newlines
        const processedSql = sql
          .replace(/\\n/g, "\n")  // Convert literal '\n' to actual newlines
          .replace(/\\''/g, "''") // Handle escaped single quotes
          .trim();

        console.log("Executing SQL:", processedSql.substring(0, 100) + "..."); // Log truncated SQL for debugging
        await prisma.$executeRawUnsafe(processedSql);
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function splitStringByNotQuotedSemicolon(input: string): string[] {
  const result: string[] = [];
  let currentSplitIndex = 0;
  let isInString = false;
  let currentChar: string;
  let prevChar: string = '';
  let buffer: string = '';

  for (let i = 0; i < input.length; i++) {
    currentChar = input[i];
    
    // Handle escaped quotes
    if (currentChar === "'" && prevChar !== '\\') {
      isInString = !isInString;
    }
    
    if (currentChar === ";" && !isInString) {
      buffer = input.substring(currentSplitIndex, i + 1).trim();
      if (buffer) {
        result.push(buffer);
      }
      currentSplitIndex = i + 1;
    }
    
    prevChar = currentChar;
  }

  // Add any remaining content
  buffer = input.substring(currentSplitIndex).trim();
  if (buffer) {
    result.push(buffer);
  }

  return result;
}

rawSql()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
