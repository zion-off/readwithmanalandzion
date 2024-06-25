import { NextResponse } from "next/server";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";
import chromium from "@sparticuz/chromium";
import path from "path";

const EXTENSION_PATH = path.resolve("./public", "extension");
const EXTENSION_ID = "lkbebcjgcmobigpeffafkodonchffocl";
const TIMEOUT_DURATION = 30000;

async function getBrowser() {
  if (process.env.VERCEL_ENV === "production") {
    const executablePath = await chromium.executablePath();

    const browser = await puppeteerCore.launch({
      args: [
        chromium.args,
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
    return browser;
  } else {
    const browser = await puppeteer.launch({
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
      ],
    });
    return browser;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  let browser;
  try {
    console.log("Launching browser...");
    browser = await getBrowser();
    console.log("Browser launched");

    const page = await browser.newPage();
    console.log("New page created");

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Operation timed out")),
        TIMEOUT_DURATION
      )
    );

    console.log("Configuring extension...");
    const optionsPageUrl = `chrome-extension://${EXTENSION_ID}/options/options.html`;
    await Promise.race([
      page.goto(optionsPageUrl, { waitUntil: "networkidle2" }),
      timeoutPromise,
    ]);
    await Promise.race([page.click("#save_top"), timeoutPromise]);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const optInUrl = `chrome-extension://${EXTENSION_ID}/options/optin/opt-in.html`;
    await Promise.race([
      page.goto(optInUrl, { waitUntil: "networkidle2" }),
      timeoutPromise,
    ]);
    await Promise.race([page.click("#optin-enable"), timeoutPromise]);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("Extension configured");

    console.log(`Navigating to ${url}...`);
    const targetUrl = decodeURIComponent(url);
    await Promise.race([
      page.goto(targetUrl, { waitUntil: "networkidle2" }),
      timeoutPromise,
    ]);
    console.log("Navigation complete");

    console.log("Generating PDF...");
    const pdfBuffer = await Promise.race([
      page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "1cm", right: "1cm", bottom: "1cm", left: "1cm" },
      }),
      timeoutPromise,
    ]);
    console.log("PDF generated");

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="generated_page.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Error generating PDF", message: error.message },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
