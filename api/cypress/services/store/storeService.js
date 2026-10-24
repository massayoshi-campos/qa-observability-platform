/// <reference types="cypress" />

cy.storeService = {
  getInventory: () => {
    return cy.apiKeyRequest("GET", "store/inventory");
  },

  createOrder: (orderData) => {
    return cy.apiKeyRequestWithJsonBody("POST", "store/order", orderData);
  },

  getOrderById: (orderId) => {
    return cy.apiKeyRequest("GET", `store/order/${orderId}`);
  },

  deleteOrderById: (orderId) => {
    return cy.apiKeyRequest("DELETE", `store/order/${orderId}`);
  },
};
