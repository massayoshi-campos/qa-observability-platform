let apiKeyToken;

// Sends an HTTP request with the API key automatically added in the headers.
Cypress.Commands.add("headersApiKey", (method, url) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      failOnStatusCode: false,
    });
  });
});

// Sends an HTTP request with an API key and a JSON body in the headers.
Cypress.Commands.add("headersWithBodyApiKey", (method, url, body) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body,
      failOnStatusCode: false,
    });
  });
});

// Decrypts and stores the API key once to reuse it in all requests.
// Avoids decrypting the token multiple times during the test run.

Cypress.Commands.add("setupApiKeyToken", () => {
  if (apiKeyToken) {
    return cy.wrap(apiKeyToken, { log: false });
  }

  return cy
    .env(["API_KEY", "PASSPHRASE"], { log: false })
    .then(({ API_KEY, PASSPHRASE }) => {
      if (!API_KEY || !PASSPHRASE) {
        throw new Error(
          "API_KEY and PASSPHRASE must be configured for this environment.",
        );
      }

      return cy.decryptText(API_KEY, PASSPHRASE);
    })
    .then((token) => {
      apiKeyToken = token;
      return cy.wrap(apiKeyToken, { log: false });
    });
});

// Wrapper to send an API request using the API key headers.
// Simplifies calling secured endpoints in the tests.
Cypress.Commands.add("apiKeyRequest", (method, url) => {
  return cy.headersApiKey(method, url);
});

// Sends a secured API request and measures how long it takes to get the response.
Cypress.Commands.add("apiKeyRequestResponseTime", (method, url) => {
  const startTime = Date.now();

  return cy.apiKeyRequest(method, url).then((response) => {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`Response time: ${responseTime}ms`);

    return { response, responseTime };
  });
});

// Sends a request with an invalid API key to simulate unauthorized access.
// Used to ensure the API properly rejects invalid credentials.
Cypress.Commands.add("invalidApiKeyTest", (method, url, apiKey) => {
  return cy.request({
    method,
    url,
    headers: {
      api_key: apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    failOnStatusCode: false,
  });
});

// Sends a request without an API key in the headers.
// Used to verify the API denies access when authentication is missing.
Cypress.Commands.add("requestWithoutApiKey", (method, url) => {
  return cy.request({
    method,
    url,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    failOnStatusCode: false,
  });
});

// Sends a secured API request to an incorrect or invalid URL.
// Used to verify how the API handles routing and not-found errors.
Cypress.Commands.add("requestWithWrongUrl", (method, url) => {
  return cy.apiKeyRequest(method, url);
});

// Wrapper to send a secured API request with a JSON body.
Cypress.Commands.add("apiKeyRequestWithJsonBody", (method, url, body) => {
  return cy.headersWithBodyApiKey(method, url, body);
});

// Sends a secured API request with a request body attached.
// Used for authenticated endpoints that require sending data.
Cypress.Commands.add("apiKeyRequestWithBody", (method, url, body) => {
  return cy.headersWithBodyApiKey(method, url, body);
});

// Sends a secured API request with a JSON body and measures the response time.
// Used to validate both performance and correctness of protected endpoints.
Cypress.Commands.add(
  "apiKeyRequestResponseTimeWithJsonBody",
  (method, url, body) => {
    const startTime = Date.now();

    return cy.headersWithBodyApiKey(method, url, body).then((response) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      console.log(`Response time: ${responseTime}ms`);

      return { response, responseTime };
    });
  },
);

// Sends a request with an invalid API key and a JSON body.
Cypress.Commands.add(
  "invalidApiKeyTestWithJsonBody",
  (method, url, apiKey, body) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body,
      failOnStatusCode: false,
    });
  },
);

// Sends a request with a JSON body but without an API key.
// Used to verify the API blocks unauthenticated requests with data.
Cypress.Commands.add(
  "requestWithoutApiKeyWithJsonBody",
  (method, url, body) => {
    return cy.request({
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body,
      failOnStatusCode: false,
    });
  },
);

// Sends a secured request with a JSON body to an incorrect or invalid URL.
// Used to verify how the API handles routing errors for POST or PUT calls.
Cypress.Commands.add("requestWithWrongUrlWithJsonBody", (method, url, body) => {
  return cy.headersWithBodyApiKey(method, url, body);
});

// Sends a secured API request for file upload using multipart/form-data.
// Used to test endpoints that receive files or binary data.
Cypress.Commands.add("apiKeyUploadRequest", (method, url, body) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        "Content-Type": "multipart/form-data",
        accept: "application/json",
      },
      body,
      failOnStatusCode: false,
    });
  });
});

// Sends a secured upload request without specifying a text response format.
// Used to test file upload endpoints that return raw or binary responses.
Cypress.Commands.add("apiKeyUploadWithoutTxt", (method, url, body) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        "Content-Type": "multipart/form-data",
        accept: "*/*",
      },
      body,
      failOnStatusCode: false,
    });
  });
});

// Sends a secured API request without the Content-Type header.
// Used to verify how the API behaves when the request format is missing.
Cypress.Commands.add("apiKeyRequestWithoutContentType", (method, url) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        accept: "application/json",
      },
      failOnStatusCode: false,
    });
  });
});

// Sends a secured DELETE request using the API key.
// Used to test authenticated resource removal endpoints.
Cypress.Commands.add("apiKeyDeleteRequest", (method, url) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        accept: "*/*",
      },
      failOnStatusCode: false,
    });
  });
});

// Sends a secured POST request using FormData and an API key.
// Used to submit forms or upload files to protected endpoints.
Cypress.Commands.add("apiKeyFormDataRequest", (url, formData) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method: "POST",
      url,
      headers: {
        api_key: apiKeyToken,
      },
      body: formData,
      failOnStatusCode: false,
    });
  });
});

// Sends a request with a JSON body but without authentication.
// Used to verify the API blocks unauthenticated data submissions.
Cypress.Commands.add("unauthRequestWithBody", (method, url, body) => {
  return cy.request({
    method,
    url,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
    failOnStatusCode: false,
  });
});

// Sends a secured request expecting a binary (PDF) response.
// Used to test endpoints that return files instead of JSON.
Cypress.Commands.add("apiKeyBinaryRequest", (method, url) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method,
      url,
      headers: {
        api_key: apiKeyToken,
        Accept: "application/pdf",
      },
      encoding: null,
      failOnStatusCode: false,
    });
  });
});

// Uploads a pet image using an API key token and optional additional metadata.
// Resolves the fixture file path and delegates the upload to a Cypress task.
Cypress.Commands.add(
  "apiKeyUploadPetImage",
  (petId, filePath, additionalMetadata = "") => {
    return cy.setupApiKeyToken().then((apiKeyToken) => {
      const absoluteFilePath = `cypress/fixtures/${filePath}`;

      return cy.task("uploadPetImage", {
        petId,
        filePath: absoluteFilePath,
        additionalMetadata,
        baseUrl: Cypress.config("baseUrl"),
        apiKeyToken,
      });
    });
  },
);

// Sends a POST request with URL-encoded form data and API key authentication.
// Disables automatic failure on HTTP error status codes for explicit response validation.
Cypress.Commands.add("apiKeyFormUrlEncodedRequest", (url, formData) => {
  return cy.setupApiKeyToken().then((apiKeyToken) => {
    return cy.request({
      method: "POST",
      url,
      headers: {
        api_key: apiKeyToken,
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      form: false,
      body: new URLSearchParams(formData).toString(),
      failOnStatusCode: false,
    });
  });
});
