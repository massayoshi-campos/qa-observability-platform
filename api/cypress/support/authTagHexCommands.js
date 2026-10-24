const crypto = require("crypto");

const algorithm = "aes-256-gcm";

// Decrypts AES-256-GCM data through the Cypress Node.js process.
Cypress.Commands.add("decryptText", (encryptedText, passphrase) => {
  return cy
    .task(
      "decryptText",
      {
        encryptedText,
        passphrase,
      },
      {
        log: false,
      },
    )
    .then((decryptedText) => {
      return cy.wrap(decryptedText, {
        log: false,
      });
    });
});
