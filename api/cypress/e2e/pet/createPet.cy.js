import "../../services/pet/petService";

describe("Petstore API - Pet CRUD Operations - Positive Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it(`POST - should create a new pet successfully`, () => {
      cy.fixture("pet/pet_golden_retriever.json").then((requestData) => {
        cy.validateDetailsResponse(
          () => cy.petService.createPet(requestData),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.have.property("id", 337);
          expect(responseBody).to.have.property("name", "Golden Retriever");
          expect(responseBody.status).to.eq("available");

          expect(responseBody.category).to.deep.equal({
            id: 12,
            name: "Dogs",
          });

          expect(responseBody.photoUrls[0]).to.eq(
            "https://images.pets.com/golden-retriever-101.jpg",
          );

          expect(responseBody.tags[0]).to.deep.equal({
            id: 5,
            name: "vaccinated",
          });

          expect(responseBody.category.id).to.be.a("number");
          expect(responseBody.category.name).to.be.a("string");

          expect(responseBody.photoUrls).to.be.an("array");
          responseBody.photoUrls.forEach((photoUrl) => {
            expect(photoUrl).to.be.a("string");
          });

          expect(responseBody.tags).to.be.an("array");
          responseBody.tags.forEach((tag) => {
            expect(tag).to.be.an("object");
            expect(tag.id).to.be.a("number");
            expect(tag.name).to.be.a("string");
          });

          expect(responseBody.status).to.be.a("string");
          expect(responseBody.status).to.be.oneOf([
            "available",
            "pending",
            "sold",
          ]);
        });
      });
    });

    it("GET - should return the pet by id", () => {
      cy.validateDetailsResponse(
        () => cy.petService.getPetById(337),
        200,
        "OK",
        true,
      ).then((res) => {
        const responseBody = res.body;

        // Validate pet data
        expect(responseBody).to.have.property("id", 337);
        expect(responseBody).to.have.property("name", "Golden Retriever");
        expect(responseBody.status).to.eq("available");

        expect(responseBody.category).to.deep.equal({
          id: 12,
          name: "Dogs",
        });

        expect(responseBody.photoUrls[0]).to.eq(
          "https://images.pets.com/golden-retriever-101.jpg",
        );

        expect(responseBody.tags[0]).to.deep.equal({
          id: 5,
          name: "vaccinated",
        });

        // Validate data types
        expect(responseBody.id).to.be.a("number");
        expect(responseBody.name).to.be.a("string");
        expect(responseBody.status).to.be.a("string");

        expect(responseBody.category).to.be.an("object");
        expect(responseBody.category.id).to.be.a("number");
        expect(responseBody.category.name).to.be.a("string");

        expect(responseBody.photoUrls).to.be.an("array");
        responseBody.photoUrls.forEach((photoUrl) => {
          expect(photoUrl).to.be.a("string");
        });

        expect(responseBody.tags).to.be.an("array");
        responseBody.tags.forEach((tag) => {
          expect(tag).to.be.an("object");
          expect(tag.id).to.be.a("number");
          expect(tag.name).to.be.a("string");
        });
      });
    });

    it(`PUT - should update the pet successfully`, () => {
      cy.fixture("pet/pet_persa.json").then((requestData) => {
        cy.validateDetailsResponse(
          () => cy.petService.updatePet(requestData),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.have.property("id", 337);
          expect(responseBody).to.have.property("name", "Persa");
          expect(responseBody.status).to.eq("pending");

          expect(responseBody.category).to.deep.equal({
            id: 13,
            name: "Cats",
          });

          expect(responseBody.photoUrls[0]).to.eq(
            "https://images.pets.com/persa-104.jpg",
          );

          expect(responseBody.tags[0]).to.deep.equal({
            id: 6,
            name: "vaccinated",
          });

          expect(responseBody.id).to.be.a("number");
          expect(responseBody.name).to.be.a("string").and.not.be.empty;
          expect(responseBody.category).to.be.an("object");
          expect(responseBody.category.id).to.be.a("number");
          expect(responseBody.category.name).to.be.a("string");

          expect(responseBody.photoUrls).to.be.an("array");
          responseBody.photoUrls.forEach((photoUrl) => {
            expect(photoUrl).to.be.a("string");
          });

          expect(responseBody.tags).to.be.an("array");
          responseBody.tags.forEach((tag) => {
            expect(tag).to.be.an("object");
            expect(tag.id).to.be.a("number");
            expect(tag.name).to.be.a("string");
          });

          expect(responseBody.status).to.be.a("string");
          expect(responseBody.status).to.be.oneOf([
            "available",
            "pending",
            "sold",
          ]);
        });
      });
    });

    it(`GET - should find the updated pet by status`, () => {
      cy.validateDetailsResponse(
        () => cy.petService.getPetsByStatus("pending"),
        200,
        "OK",
        true,
      ).then((res) => {
        const responseBody = res.body;
        expect(responseBody).to.be.an("array");
        const pet = responseBody.find((p) => p.id === 337);
        expect(pet, "Pet with id 337 should exist in findByStatus").to.not.be
          .undefined;
        expect(pet.id).to.eq(337);
        expect(pet.name).to.eq("Persa");
        expect(pet.status).to.eq("pending");
        expect(pet.category).to.deep.equal({
          id: 13,
          name: "Cats",
        });
        expect(pet.photoUrls[0]).to.eq("https://images.pets.com/persa-104.jpg");
        expect(pet.tags[0]).to.deep.equal({
          id: 6,
          name: "vaccinated",
        });

        responseBody.forEach((pet) => {
          expect(pet.status).to.eq("pending");
          expect(pet.id).to.be.a("number");
          expect(pet.name).to.be.a("string");
          expect(pet.photoUrls).to.be.an("array");
          expect(pet.tags).to.be.an("array");
        });
      });
    });

    it("POST/GET/DELETE - should manage a pet with available status", () => {
      cy.fixture("pet/pet_available.json").then((petData) => {
        cy.petService.createPet(petData).then((createRes) => {
          expect(createRes.status).to.eq(200);
          expect(createRes.body.id).to.eq(petData.id);
          expect(createRes.body.status).to.eq("available");

          cy.petService.getPetsByStatus("available").then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an("array");

            const pet = res.body.find((p) => p.id === petData.id);

            expect(pet, "Created pet should be found by status").to.not.be
              .undefined;
            expect(pet.id).to.eq(petData.id);
            expect(pet.name).to.eq(petData.name);
            expect(pet.status).to.eq("available");
            expect(pet.category).to.deep.equal(petData.category);
            expect(pet.photoUrls).to.deep.equal(petData.photoUrls);
            expect(pet.tags).to.deep.equal(petData.tags);
          });

          cy.petService.deletePetById(petData.id).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);

            cy.petService.getPetById(petData.id).then((getRes) => {
              expect(getRes.status).to.eq(404);
              expect(getRes.body.message).to.eq("Pet not found");
            });
          });
        });
      });
    });

    it("POST/GET/DELETE - should manage a pet with sold status", () => {
      cy.fixture("pet/pet_sold.json").then((petData) => {
        cy.petService.createPet(petData).then((createRes) => {
          expect(createRes.status).to.eq(200);
          expect(createRes.body.id).to.eq(petData.id);
          expect(createRes.body.status).to.eq("sold");

          cy.petService.getPetsByStatus("sold").then((res) => {
            expect(res.status).to.eq(200);
            expect(res.body).to.be.an("array");

            const pet = res.body.find((p) => p.id === petData.id);

            expect(pet, "Created pet should be found by status").to.not.be
              .undefined;
            expect(pet.id).to.eq(petData.id);
            expect(pet.name).to.eq(petData.name);
            expect(pet.status).to.eq("sold");
            expect(pet.category).to.deep.equal(petData.category);
            expect(pet.photoUrls).to.deep.equal(petData.photoUrls);
            expect(pet.tags).to.deep.equal(petData.tags);
          });

          cy.petService.deletePetById(petData.id).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);

            cy.petService.getPetById(petData.id).then((getRes) => {
              expect(getRes.status).to.eq(404);
              expect(getRes.body.message).to.eq("Pet not found");
            });
          });
        });
      });
    });

    it(`DELETE - should delete the pet successfully`, () => {
      cy.validateDetailsResponse(
        () => cy.petService.deletePetById(337),
        200,
        "OK",
        true,
      ).then((res) => {
        const responseBody = res.body;
        expect(responseBody).to.have.property("code", 200);
        expect(responseBody).to.have.property("type");
        expect(responseBody).to.have.property("message", "337");
      });
    });

    it("GET - should return 404 after pet is deleted", () => {
      cy.petService.getPetById(337).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.message).to.eq("Pet not found");
      });
    });

    it("POST - should allow recreating the pet after deletion", () => {
      cy.fixture("pet/pet_golden_retriever.json").then((requestData) => {
        cy.petService.createPet(requestData).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.id).to.eq(337);
        });
      });
    });

    it("GET - should return a valid pet contract", () => {
      cy.petService.getPetById(337).then((res) => {
        expect(res.body).to.have.all.keys(
          "id",
          "category",
          "name",
          "photoUrls",
          "tags",
          "status",
        );
      });
    });

    it("PUT - should allow updating the pet multiple times", () => {
      cy.fixture("pet/pet_persa.json").then((update1) => {
        cy.petService.updatePet(update1).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.be.an("object");

          expect(res.body.id).to.eq(update1.id);
          expect(res.body.name).to.eq("Persa");
          expect(res.body.status).to.eq("pending");

          expect(res.body.category).to.deep.equal({
            id: 13,
            name: "Cats",
          });

          cy.fixture("pet/pet_golden_retriever.json").then((update2) => {
            cy.petService.updatePet(update2).then((res) => {
              expect(res.status).to.eq(200);
              expect(res.body).to.be.an("object");

              expect(res.body.id).to.eq(update2.id);
              expect(res.body.name).to.eq("Golden Retriever");
              expect(res.body.status).to.eq("available");

              expect(res.body.category).to.deep.equal({
                id: 12,
                name: "Dogs",
              });
            });
          });
        });
      });
    });

    it("GET - should return the same data on repeated calls", () => {
      cy.petService.getPetById(337).then((res1) => {
        cy.petService.getPetById(337).then((res2) => {
          expect(res1.body).to.deep.equal(res2.body);
        });
      });
    });

    it("POST - should create a pet and upload its image", () => {
      const petId = 340;

      const petData = {
        id: petId,
        name: "Pet for image upload",
        photoUrls: [],
        tags: [],
        status: "available",
      };

      cy.petService
        .createPet(petData)
        .then((createRes) => {
          expect(createRes.status).to.eq(200);
          expect(createRes.body.id).to.eq(petId);
          expect(createRes.body.name).to.eq(petData.name);

          return cy.petService.uploadPetImage(
            petId,
            "pet-image.png",
            "Cypress image upload",
          );
        })
        .then((uploadRes) => {
          cy.log(`Upload HTTP status: ${uploadRes.status}`);
          cy.log(`Upload response body: ${JSON.stringify(uploadRes.body)}`);

          expect(uploadRes.status).to.eq(200);
          expect(uploadRes.body).to.have.property("code", 200);
          expect(uploadRes.body).to.have.property("type");
          expect(uploadRes.body.message).to.include("File uploaded to");
          expect(uploadRes.body.message).to.include("pet-image.png");
        })
        .then(() => {
          cy.petService.deletePetById(petId).then((deleteRes) => {
            expect(deleteRes.status).to.be.oneOf([200, 204]);
          });
        });
    });

    it("POST - should update a pet using form data successfully", () => {
      const petId = 341;
      const petData = {
        id: petId,
        name: "Pet before form update",
        photoUrls: [],
        tags: [],
        status: "available",
      };

      cy.petService
        .createPet(petData)
        .then((createRes) => {
          expect(createRes.status).to.eq(200);

          return cy.petService.updatePetWithForm(
            petId,
            "Pet after form update",
            "sold",
          );
        })
        .then((updateRes) => {
          cy.log(`Form update status: ${updateRes.status}`);
          cy.log(`Form update body: ${JSON.stringify(updateRes.body)}`);

          expect(updateRes.status).to.eq(200);

          return cy.petService.getPetById(petId);
        })
        .then((getRes) => {
          expect(getRes.status).to.eq(200);
          expect(getRes.body.id).to.eq(petId);
          expect(getRes.body.name).to.eq("Pet after form update");
          expect(getRes.body.status).to.eq("sold");
        })
        .then(() => {
          return cy.petService.deletePetById(petId);
        })
        .then((deleteRes) => {
          expect(deleteRes.status).to.be.oneOf([200, 204]);
        });
    });
  });
});

describe("Petstore API - Pet CRUD Operations - Negative Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("POST - should not accept invalid data types", () => {
      const invalidBody = {
        id: "ABC",
        name: true,
        status: 999,
      };

      cy.apiKeyRequestWithJsonBody("POST", "pet", invalidBody).then((res) => {
        expect(res.status).to.eq(500);
      });
    });

    it("GET - should return 404 for an invalid endpoint", () => {
      cy.petService.callWrongEndpoint().then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it("GET - should reject a non-numeric pet ID", () => {
      const invalidPetId = "abc";

      cy.petService.getPetById(invalidPetId).then((res) => {
        expect(res.status).to.be.oneOf([400, 404]);
      });
    });

    it("GET - should return 404 for pet ID zero", () => {
      cy.petService.getPetById(0).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property("message", "Pet not found");
      });
    });

    it("PATCH - should reject unsupported HTTP method", () => {
      cy.petService.callInvalidMethod().then((res) => {
        expect(res.status).to.be.oneOf([400, 405]);
      });
    });

    it("GET - should return 404 for a non-existent pet ID", () => {
      const nonExistentPetId = 999999999999;

      cy.petService.getPetById(nonExistentPetId).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.have.property("message", "Pet not found");
      });
    });

    it("PUT - should handle invalid data types", () => {
      const invalidBody = {
        id: "ABC",
        name: true,
        status: 999,
      };

      cy.petService.updatePet(invalidBody).then((res) => {
        expect(res.status).to.eq(500);

        expect(res.body).to.deep.equal({
          code: 500,
          type: "unknown",
          message: "something bad happened",
        });
      });
    });

    it("DELETE - should handle a non-existent pet ID", () => {
      const nonExistentPetId = 999999999999;

      cy.petService.deletePetById(nonExistentPetId).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body).to.be.empty;
      });
    });
  });
});

describe("Pet API - Edge Cases and API Behavior", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("POST - should handle a partial JSON body", () => {
      const partialBody = {
        name: "Pet without remaining fields",
      };

      cy.apiKeyRequestWithJsonBody("POST", "pet", partialBody).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("id");
        expect(res.body.id).to.be.a("number");

        expect(res.body.name).to.eq(partialBody.name);
        expect(res.body.photoUrls).to.deep.equal([]);
        expect(res.body.tags).to.deep.equal([]);

        expect(res.body).not.to.have.property("category");
        expect(res.body).not.to.have.property("status");
      });
    });

    it("PUT - should handle an empty JSON body", () => {
      const emptyBody = {};

      cy.petService.updatePet(emptyBody).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("id");
        expect(res.body.id).to.be.a("number");

        expect(res.body.photoUrls).to.deep.equal([]);
        expect(res.body.tags).to.deep.equal([]);
      });
    });

    it("PUT - should handle a partial JSON body", () => {
      const partialBody = {
        name: "Pet updated with partial body",
      };

      cy.petService.updatePet(partialBody).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("object");

        expect(res.body).to.have.property("id");
        expect(res.body.id).to.be.a("number");

        expect(res.body.name).to.eq(partialBody.name);
        expect(res.body.photoUrls).to.deep.equal([]);
        expect(res.body.tags).to.deep.equal([]);

        expect(res.body).not.to.have.property("category");
        expect(res.body).not.to.have.property("status");
      });
    });

    it("GET - should return an empty array for an unknown pet status", () => {
      cy.petService.getPetsByStatus("unknown").then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array").that.is.empty;
      });
    });

    it("PUT - should create a pet when the ID does not exist", () => {
      cy.fixture("pet/pet_golden_retriever.json").then((petData) => {
        const nonExistentPet = {
          ...petData,
          id: 999999999998,
          name: "Pet Updated With Non-existent ID",
        };

        cy.petService.updatePet(nonExistentPet).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.id).to.eq(nonExistentPet.id);
          expect(res.body.name).to.eq(nonExistentPet.name);
        });

        // GET - Verify the pet created by PUT
        cy.petService.getPetById(nonExistentPet.id).then((getRes) => {
          expect(getRes.status).to.eq(200);
          expect(getRes.body.id).to.eq(nonExistentPet.id);
          expect(getRes.body.name).to.eq(nonExistentPet.name);
        });

        // DELETE - Clean up the test data
        cy.petService.deletePetById(nonExistentPet.id).then((deleteRes) => {
          expect(deleteRes.status).to.eq(200);

          // GET - Verify the pet was deleted
          cy.petService.getPetById(nonExistentPet.id).then((verifyRes) => {
            expect(verifyRes.status).to.eq(404);
            expect(verifyRes.body.message).to.eq("Pet not found");
          });
        });
      });
    });
  });
});
