// This command makes a request to a URL and checks the expected responses how 'status', 'statusText', 'body' and 'isOkStatusCode' (equal*).
Cypress.Commands.add(
  "validateResponse",
  (method, status, statusText, body, isOkStatusCode) => {
    method().as("response");

    cy.get("@response").then((res) => {
      expect(res.status).to.be.equal(status);
      expect(res.statusText).to.be.equal(statusText);
      expect(res.body).to.be.equal(body);
      expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
    });
  }
);

// This command makes a request to a URL and checks the expected responses:
// 'status', 'statusText', and 'isOkStatusCode' (equal), and optionally validates headers with .include().
Cypress.Commands.add(
  "validateResponseAsync",
  (method, status, statusText, isOkStatusCode) => {
    method().as("response");

    cy.get("@response").then((res) => {
      expect(res.status).to.equal(status);
      expect(res.statusText).to.equal(statusText);
      expect(res.isOkStatusCode).to.equal(isOkStatusCode);
    });
  }
);

// This command makes a request and validates:
// status, statusText, body content (from binary), and isOkStatusCode.
Cypress.Commands.add(
  "validateBinaryResponseInclude",
  (method, status, statusText, expectedBodyMessage, isOkStatusCode) => {
    method().as("response");

    cy.get("@response").then((res) => {
      const resBody = Cypress.Blob.arrayBufferToBinaryString(res.body);

      expect(res.status).to.equal(status);
      expect(res.statusText).to.equal(statusText);
      expect(res.isOkStatusCode).to.equal(isOkStatusCode);
      expect(resBody).to.include(expectedBodyMessage);
    });
  }
);

/**
 * This command makes a request and validates:
 * - HTTP status code, Statustext, isOkStatusCode
 * - Body content (from binary response), using string or RegExp match
 * Useful for validating dynamic or partial content from binary responses (like error messages).
 */
Cypress.Commands.add(
  "validateBinaryResponseWithBodyMatch",
  (method, status, statusText, expectedBodyMatch, isOkStatusCode) => {
    method().as("response");

    cy.get("@response").then((res) => {
      const resBody = Cypress.Blob.arrayBufferToBinaryString(res.body);

      expect(res.status).to.equal(status);
      expect(res.statusText).to.equal(statusText);
      expect(res.isOkStatusCode).to.equal(isOkStatusCode);

      if (typeof expectedBodyMatch === "string") {
        expect(resBody).to.include(expectedBodyMatch);
      } else if (expectedBodyMatch instanceof RegExp) {
        expect(resBody).to.match(expectedBodyMatch);
      } else {
        throw new Error("expectedBodyMatch must be a string or RegExp");
      }
    });
  }
);

/**
 * Validates an error response with a binary body.
 * Converts ArrayBuffer to string and checks status, statusText, and body content.
 */
Cypress.Commands.add(
  "validateBinaryErrorResponse",
  (res, expectedStatus, expectedStatusText, expectedMessage) => {
    const resBody = Cypress.Blob.arrayBufferToBinaryString(res.body);

    expect(res.status).to.equal(expectedStatus);
    expect(res.statusText).to.equal(expectedStatusText);
    expect(resBody).to.include(expectedMessage);
  }
);

// It validates that the response body matches one of the expected possible values.
Cypress.Commands.add(
  "checkMultipleResponseBodies",
  (method, status, statusText, expectedBodies, isOkStatusCode) => {
    method().as("response");

    cy.get("@response").then((res) => {
      expect(res.status).to.be.equal(status);
      expect(res.statusText).to.be.equal(statusText);
      const bodyContainsExpectedValue = expectedBodies.some((expectedBody) =>
        res.body.toString().includes(expectedBody)
      );
      expect(bodyContainsExpectedValue).to.be.true;
      expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
    });
  }
);

// This command makes multiple requests, with an interval between each one, and checks
// if the response status is less than 429 to avoid rate limits.
Cypress.Commands.add(
  "validateMultipleRequests",
  (method, maxRequests, intervalTime) => {
    for (let i = 0; i < maxRequests; i++) {
      method().as(`response_${i}`);
      cy.wait(intervalTime);
      cy.get(`@response_${i}`).then((res) => {
        expect(res.status).to.be.lessThan(429);
      });
    }
  }
);

// This command checks the response time of a request, ensuring it is less than 2 seconds.
Cypress.Commands.add(
  "validateResponseTime",
  (method, status, statusText, isOkStatusCode, responseClock) => {
    cy.clock();

    method().as("response");

    cy.get("@response").then((data) => {
      const { response, responseTime } = data;

      expect(response.status).to.be.equal(status);
      expect(response.statusText).to.be.equal(statusText);
      expect(response.isOkStatusCode).to.be.equal(isOkStatusCode);
      expect(responseTime).to.be.lessThan(responseClock);

      cy.clock().then((clock) => {
        clock.restore();
      });
    });
  }
);

// This command makes a request and checks the expected responses how status, statusText and isOkStatusCode, without 'body'.
Cypress.Commands.add(
  "validateDetailsResponse",
  (method, status, statusText, isOkStatusCode) => {
    return method().then((res) => {
      if (res) {
        expect(res.status).to.eq(status);
        expect(res.statusText).to.be.equal(statusText);
        expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
      }
      return res;
    });
  }
);

// Converts responseBody to an array and checks if it contains the 'first' item of expectedData.
Cypress.Commands.add(
  "validateConvertedResponse",
  (responseBody, expectedData) => {
    const convertedResponse = [responseBody];
    const firstExpectedItem = expectedData[0];
    expect(JSON.stringify(convertedResponse)).to.deep.contains(
      JSON.stringify(firstExpectedItem)
    );
  }
);

// Converts responseBody to an array and checks if it contains the 'last' item of expectedData
Cypress.Commands.add(
  "validateConvertedResponseWithLastItem",
  (responseBody, expectedData) => {
    const convertedResponse = [responseBody];
    const lastExpectedItem = expectedData[expectedData.length - 1];
    expect(JSON.stringify(convertedResponse)).to.deep.contains(
      JSON.stringify(lastExpectedItem)
    );
  }
);

// This command converts the response body to an array and compares it with the expected data in the fixture file.
Cypress.Commands.add(
  "validateConvertedResponseWholeBody",
  (responseBody, expectedData) => {
    const convertedResponse = [responseBody];
    expect(JSON.stringify(convertedResponse)).to.deep.contains(
      JSON.stringify(expectedData)
    );
  }
);

// This command makes a request to a URL and checks the expected responses how status, statusText, body and isOkStatusCode using 'fixture' data (equal*).
Cypress.Commands.add(
  "validateResponseFixturePath",
  (method, status, statusText, body, isOkStatusCode, fixturePath) => {
    cy.fixture(fixturePath).then((requestData) => {
      method(requestData).as("response");

      cy.get("@response").then((res) => {
        expect(res.status).to.be.equal(status);
        expect(res.statusText).to.be.equal(statusText);
        expect(res.body).to.be.equal(body);
        expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
      });
    });
  }
);

// This command makes a request to a URL and checks the expected responses how status, statusText and isOkStatusCode using 'fixture' data (equal*).
// Without 'body'.
Cypress.Commands.add(
  "validateResponseDetailsFixturePath",
  (requestFunction, status, statusText, isOkStatusCode, fixturePath) => {
    cy.fixture(fixturePath).then((requestData) => {
      requestFunction(requestData).as("response");

      cy.get("@response").then((res) => {
        expect(res.status).to.be.equal(status);
        expect(res.statusText).to.be.equal(statusText);
        expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
        return res; // Returning res after the checks
      });
    });
  }
);

// This command makes a request to a URL, checks the expected responses (status, statusText, isOkStatusCode) and loads expected data from a fixture.
Cypress.Commands.add(
  "validateResponseWithFixtureExpectedData",
  (requestFunction, status, statusText, isOkStatusCode, fixturePath) => {
    return cy.fixture(fixturePath).then((expectedData) => {
      return requestFunction()
        .as("response")
        .then((res) => {
          expect(res.status).to.be.equal(status);
          expect(res.statusText).to.be.equal(statusText);
          expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
          return { res, expectedData }; // Returning both res and expectedData after the checks
        });
    });
  }
);

// This command makes multiple requests using data from a fixture file,
// with intervals, and checks response status to avoid rate limits.
Cypress.Commands.add(
  "validateMultipleRequestsFixturePath",
  (method, maxRequests, intervalTime, fixturePath) => {
    cy.fixture(fixturePath).then((requestData) => {
      for (let i = 0; i < maxRequests; i++) {
        method(requestData).as(`response_${i}`);
        cy.wait(intervalTime);
        cy.get(`@response_${i}`).then((res) => {
          expect(res.status).to.be.lessThan(429);
        });
      }
    });
  }
);

// This command checks the response time of a request using fixture data,
// ensuring it is less than a specified time.
Cypress.Commands.add(
  "validateResponseTimeFixturePath",
  (method, status, statusText, isOkStatusCode, responseClock, fixturePath) => {
    cy.fixture(fixturePath).then((requestData) => {
      cy.clock();

      method(requestData).as("response");

      cy.get("@response").then((data) => {
        const { response, responseTime } = data;

        expect(response.status).to.be.equal(status);
        expect(response.statusText).to.be.equal(statusText);
        expect(response.isOkStatusCode).to.be.equal(isOkStatusCode);
        expect(responseTime).to.be.lessThan(responseClock);

        cy.clock().then((clock) => {
          clock.restore();
        });
      });
    });
  }
);

// Compare the specified item in the expected data with the specified item in the actual response body with (fixturePath)
Cypress.Commands.add(
  "verifyItemAtIndexFixturePath",
  (fixturePath, res, index) => {
    cy.fixture(fixturePath).then((expectedData) => {
      const expectedItem = expectedData.Values[index];
      const actualItem = res.Values[index];
      expect(actualItem).to.deep.equal(expectedItem);
      return res; // Returning res after the checks
    });
  }
);

// Compare the specified item in the expected data with the specified item in the actual response body
Cypress.Commands.add("verifyItemAtIndex", (expectedData, res, index) => {
  const expectedItem = expectedData[index];
  const actualItem = res[index];
  expect(actualItem).to.deep.equal(expectedItem);
  return res; // Returning res after the checks
  
});

// Compares the JSON stringified response body with the expected data to ensure they match.
Cypress.Commands.add("compareResponses", (responseBody, expectedData) => {
  const convertedResponse = [responseBody];
  expect(JSON.stringify(convertedResponse)).to.include(
    JSON.stringify(expectedData)
  );
});

// Compares the item at the specified position from the end in the expected data with the item at the same position in the actual response body
// last item = 1 | penultimate = 2 | etc.
Cypress.Commands.add(
  "compareItemIndex",
  (expectedData, responseBody, index) => {
    const expectedItem = expectedData[expectedData.length - index];
    const returnedItem = responseBody[responseBody.length - index];
    expect(returnedItem).to.deep.equal(expectedItem);
  }
);

// Command to validate if a property with a specific value exists within an array of objects or a single object.
Cypress.Commands.add(
  "validateJsonPropertyArray",
  (responseBody, property, expectedValue) => {
    let found = false;

    if (Array.isArray(responseBody)) {
      found = responseBody.some((item) => item[property] === expectedValue);
    } else if (typeof responseBody === "object") {
      found = responseBody[property] === expectedValue;
    }
    expect(found, `Expected to find ${property}: ${expectedValue}`).to.be.true;
  }
);

// This command makes a request and checks the expected responses with the attached file.
Cypress.Commands.add(
  "uploadFile",
  (method, status, statusText, isOkStatusCode, fixturePath) => {
    cy.fixture(fixturePath).then((fileContent) => {
      const blob = new Blob([fileContent], { type: "text/plain" });
      const formData = new FormData();
      formData.append("inputStream", blob, fixturePath);
      method(formData).as("response");

      cy.get("@response").then((res) => {
        expect(res.status).to.be.equal(status);
        expect(res.statusText).to.be.equal(statusText);
        expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
      });
    });
  }
);

// This command makes a request and checks the expected responses with the different text attached file.
Cypress.Commands.add(
  "uploadFileWithoutTxt",
  (method, status, statusText, isOkStatusCode, fixturePath) => {
    cy.fixture(fixturePath, "binary", { encoding: null }).then(
      (fileContent) => {
        const blob = new Blob([fileContent]);
        const formData = new FormData();
        formData.append("file", blob, fixturePath);
        method(formData).as("response");

        cy.get("@response").then((res) => {
          expect(res.status).to.be.equal(status);
          expect(res.statusText).to.be.equal(statusText);
          expect(res.isOkStatusCode).to.be.equal(isOkStatusCode);
        });
      }
    );
  }
);








