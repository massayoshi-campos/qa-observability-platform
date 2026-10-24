/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars

const fs = require("fs-extra");
const path = require("path");
const crypto = require("crypto");
const pdfParse = require("pdf-parse");
const { PDFDocument } = require("pdf-lib");
const localStoragePlugin = require("cypress-localstorage-commands/plugin");
const FormData = require("form-data");
const https = require("https");
let pdfjsLib = null;

// Loads a JSON configuration file based on the selected environment.
// Used to apply environment-specific settings like URLs and credentials.
function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve("./config", `${file}.json`);
  return fs.readJson(pathToConfigFile);
}

// Decrypts a text encrypted with AES-256-GCM using a passphrase.
// Used to securely retrieve sensitive data like API keys or tokens.
function decrypt(encryptedText, passphrase) {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = crypto.createHash("sha256").update(passphrase).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = (on, config) => {
  config.expose = config.expose || {};
  localStoragePlugin(on, config);

  on("task", {
    // Decrypts AES-256-GCM data using Node.js crypto.
    decryptText({ encryptedText, passphrase }) {
      if (!encryptedText || !passphrase) {
        throw new Error(
          "Encrypted text and passphrase are required for decryption.",
        );
      }

      return decrypt(encryptedText, passphrase);
    },

    parsePdf(filePath) {
      const fileBuffer = fs.readFileSync(filePath);
      return pdfParse(fileBuffer).then((data) => data.text);
    },

    // Reads a PDF file and returns the total number of pages.
    // Used to verify that the document has the expected page count.
    async getPdfPageCount(filePath) {
      const buffer = fs.readFileSync(filePath);
      return pdfParse(buffer).then((data) => {
        return data.numpages;
      });
    },

    // Reads the first page of a PDF and determines if it is portrait or landscape.
    // Used to validate the document layout and orientation.
    async getPdfOrientation(filePath) {
      const fileBuffer = fs.readFileSync(path.resolve(filePath));
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
      return width > height ? "landscape" : "portrait";
    },

    // Reads the first page of a PDF and returns its size in millimeters.
    // Used to validate that the document matches the expected page format.
    async getPdfPageSize(filePath) {
      const fileBuffer = fs.readFileSync(path.resolve(filePath));
      const pdfDoc = await PDFDocument.load(fileBuffer);
      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
      return {
        width: +(width * 0.352778).toFixed(2),
        height: +(height * 0.352778).toFixed(2),
      };
    },

    async uploadPetImage({
      petId,
      filePath,
      additionalMetadata,
      baseUrl,
      apiKeyToken,
    }) {
      const form = new FormData();

      form.append("file", fs.createReadStream(path.resolve(filePath)), {
        filename: path.basename(filePath),
        contentType: "image/png",
      });

      if (additionalMetadata) {
        form.append("additionalMetadata", additionalMetadata);
      }

      const url = new URL(
        `pet/${petId}/uploadImage`,
        `${baseUrl.replace(/\/+$/, "")}/`,
      );

      return new Promise((resolve, reject) => {
        const request = https.request(
          url,
          {
            method: "POST",
            headers: {
              ...form.getHeaders(),
              accept: "application/json",
              api_key: apiKeyToken,
            },
          },
          (response) => {
            let responseBody = "";

            response.setEncoding("utf8");

            response.on("data", (chunk) => {
              responseBody += chunk;
            });

            response.on("end", () => {
              let body = responseBody;

              try {
                body = JSON.parse(responseBody);
              } catch {
                // Mantém o texto original se a resposta não for JSON.
              }

              resolve({
                status: response.statusCode,
                headers: response.headers,
                body,
              });
            });
          },
        );

        request.on("error", reject);
        form.pipe(request);
      });
    },

    // Reads a PDF file and retrieves the names of all embedded attachments.
    // Used to verify that the PDF contains the expected attached files.
    async listPdfAttachments(filePath) {
      if (!pdfjsLib) {
        pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      }

      const data = new Uint8Array(fs.readFileSync(path.resolve(filePath)));
      const loadingTask = pdfjsLib.getDocument({ data });
      const pdf = await loadingTask.promise;
      const attachments = await pdf.getAttachments();

      if (!attachments) return [];
      return Object.keys(attachments);
    },
  });

  // return getConfigurationByFile(file);
  const file = config.env.configFile || "qa";

  // 🔹 Load the file and merge ENV variables and other configs
  return getConfigurationByFile(file).then((fileConfig) => {
    // Merge environment variables at runtime
    config.env = {
      ...config.env,
      ...fileConfig.env,
    };

    // Merge other configs (such as baseUrl)
    return {
      ...config,
      ...fileConfig,
    };
  });
};
