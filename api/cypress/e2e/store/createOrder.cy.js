import "../../services/store/storeService";

let createdOrderId;

describe("Store API - Positive Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("GET - should return store inventory", () => {
      cy.storeService.getInventory().then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.not.be.empty;
      });
    });

    it("POST - should create an order", () => {
      cy.fixture("store/order.json").then((orderData) => {
        return cy.storeService.createOrder(orderData).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.id).to.eq(orderData.id);

          expect(res.body.petId).to.eq(orderData.petId);
          expect(res.body.quantity).to.eq(orderData.quantity);
          expect(res.body.status).to.eq(orderData.status);

          createdOrderId = res.body.id;
        });
      });
    });

    it("DELETE - should delete the created order", () => {
      expect(createdOrderId, "ID of the created order").to.exist;

      cy.storeService.deleteOrderById(createdOrderId).then((res) => {
        expect(res.status).to.be.oneOf([200, 204]);
      });
    });

    it("POST - should create, retrieve and delete an order", () => {
      cy.fixture("store/order.json").then((orderData) => {
        cy.storeService
          .createOrder(orderData)
          .then((createRes) => {
            expect(createRes.status).to.eq(200);
            expect(createRes.body.id).to.eq(orderData.id);

            return cy.storeService.getOrderById(orderData.id);
          })
          .then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body.id).to.eq(orderData.id);
            expect(getRes.body.petId).to.eq(orderData.petId);
            expect(getRes.body.quantity).to.eq(orderData.quantity);
            expect(getRes.body.status).to.eq(orderData.status);

            return cy.storeService.deleteOrderById(orderData.id);
          })
          .then((deleteRes) => {
            expect(deleteRes.status).to.be.oneOf([200, 204]);
          });
      });
    });

    it("GET - should return store inventory with valid quantities", () => {
      cy.storeService.getInventory().then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.not.be.empty;

        Object.entries(res.body).forEach(([status, quantity]) => {
          expect(status).to.be.a("string").and.not.be.empty;

          expect(
            typeof quantity,
            `Quantity for status "${status}" should be a number`,
          ).to.eq("number");

          expect(
            Number.isInteger(quantity),
            `Quantity for status "${status}" should be an integer`,
          ).to.eq(true);

          expect(
            quantity,
            `Quantity for status "${status}" should be non-negative`,
          ).to.be.at.least(0);
        });
      });
    });
  });
});

describe("Store API - Negative Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("GET - should handle a non-existent order", () => {
      cy.storeService.getOrderById(0).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property("code", 1);
        expect(res.body).to.have.property("type", "error");
        expect(res.body).to.have.property("message", "Order not found");
      });
    });

    it("DELETE - should handle a non-existent order", () => {
      cy.storeService.deleteOrderById(1).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property("code", 404);
        expect(res.body).to.have.property("type", "unknown");
        expect(res.body).to.have.property("message", "Order Not Found");
      });
    });

    it("GET - should handle an order with a negative ID", () => {
      cy.storeService.getOrderById(-1).then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(404);
      });
    });

    it("GET - should handle a non-numeric order ID", () => {
      cy.storeService.getOrderById("abc").then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(404);
      });
    });

    it("POST - should investigate an order with non-numeric quantity", () => {
      cy.fixture("store/orderWithStringQuantity.json").then((orderData) => {
        cy.storeService.createOrder(orderData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(500);
        });
      });
    });
  });
});

describe("Store API - Edge Cases and API Behavior", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("POST - should evaluate an order with zero quantity", () => {
      cy.fixture("store/zeroQuantityOrder.json").then((orderData) => {
        cy.storeService.createOrder(orderData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);

          return cy.storeService
            .deleteOrderById(orderData.id)
            .then((deleteRes) => {
              expect(deleteRes.status).to.be.oneOf([200, 204]);
            });
        });
      });
    });
    it("POST - should accept an order with negative quantity", () => {
      cy.fixture("store/invalidOrder.json").then((orderData) => {
        cy.storeService.createOrder(orderData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);

          if (res.status === 200) {
            return cy.storeService
              .deleteOrderById(orderData.id)
              .then((deleteRes) => {
                expect(deleteRes.status).to.be.oneOf([200, 204]);
              });
          }
        });
      });
    });

    it("POST - should evaluate an order with zero quantity", () => {
      cy.fixture("store/zeroQuantityOrder.json").then((orderData) => {
        cy.storeService.createOrder(orderData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);

          return cy.storeService
            .deleteOrderById(orderData.id)
            .then((deleteRes) => {
              expect(deleteRes.status).to.be.oneOf([200, 204]);
            });
        });
      });
    });
    it("POST - should evaluate an order without quantity", () => {
      cy.fixture("store/orderWithoutQuantity.json").then((orderData) => {
        cy.storeService.createOrder(orderData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);

          return cy.storeService
            .deleteOrderById(orderData.id)
            .then((deleteRes) => {
              expect(deleteRes.status).to.be.oneOf([200, 204]);
            });
        });
      });
    });
    it("POST - should document API behavior for an invalid order status", () => {
      cy.fixture("store/invalidOrderStatus.json").then((orderData) => {
        cy.storeService.createOrder(orderData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          if (res.status === 200) {
            return cy.storeService
              .deleteOrderById(orderData.id)
              .then((deleteRes) => {
                expect(deleteRes.status).to.be.oneOf([200, 204]);
              });
          }

          cy.log(`Unexpected HTTP status: ${res.status}`);
        });
      });
    });
  });
});
