cy.petService = {
  getPetsByStatus: (status) => {
    return cy.apiKeyRequest("GET", `pet/findByStatus?status=${status}`);
  },

  createPet: (petData) => {
    return cy.apiKeyRequestWithJsonBody("POST", "pet", petData);
  },

  getPetById: (petId) => {
    return cy.apiKeyRequest("GET", `pet/${petId}`);
  },

  updatePet: (petData) => {
    return cy.apiKeyRequestWithJsonBody("PUT", "pet", petData);
  },

  deletePetById: (petId) => {
    return cy.apiKeyRequest("DELETE", `pet/${petId}`);
  },

  callWrongEndpoint: () => {
    return cy.apiKeyRequest("GET", "pettt/123");
  },

  callInvalidMethod: () => {
    return cy.apiKeyRequest("PATCH", "pet");
  },

  uploadPetImage: (petId, filePath, additionalMetadata = "") => {
    return cy.apiKeyUploadPetImage(petId, filePath, additionalMetadata);
  },

  updatePetWithForm: (petId, name, status) => {
    return cy.apiKeyFormUrlEncodedRequest(`pet/${petId}`, {
      name,
      status,
    });
  },
};
