import "../../services/user/userService";

describe("User API - Positive Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("POST - should create a new user successfully", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.validateDetailsResponse(
          () => cy.userService.createUser(userData),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("code", 200);
          expect(responseBody).to.have.property("type");
          expect(responseBody.message).to.eq(String(userData.id));
        });
      });
    });

    it("GET - should return the user by username", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.validateDetailsResponse(
          () => cy.userService.getUserByUsername(userData.username),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("id", userData.id);
          expect(responseBody).to.have.property("username", userData.username);
          expect(responseBody).to.have.property(
            "firstName",
            userData.firstName,
          );
          expect(responseBody).to.have.property("lastName", userData.lastName);
          expect(responseBody).to.have.property("email", userData.email);
          expect(responseBody).to.have.property("phone", userData.phone);
          expect(responseBody).to.have.property(
            "userStatus",
            userData.userStatus,
          );
        });
      });
    });

    it("PUT - should update the user successfully", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.fixture("user/updatedUser.json").then((updatedUserData) => {
          const updatedUser = {
            ...userData,
            ...updatedUserData,
          };

          cy.validateDetailsResponse(
            () => cy.userService.updateUser(userData.username, updatedUser),
            200,
            "OK",
            true,
          ).then((res) => {
            const responseBody = res.body;

            expect(responseBody).to.be.an("object");
            expect(responseBody).to.have.property("code", 200);
            expect(responseBody).to.have.property("type");
            expect(responseBody.message).to.eq(String(userData.id));
          });

          cy.userService.getUserByUsername(userData.username).then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body.username).to.eq(userData.username);
            expect(getRes.body.firstName).to.eq(updatedUser.firstName);
            expect(getRes.body.lastName).to.eq(updatedUser.lastName);
            expect(getRes.body.email).to.eq(updatedUser.email);
            expect(getRes.body.phone).to.eq(updatedUser.phone);
            expect(getRes.body.userStatus).to.eq(updatedUser.userStatus);
          });
        });
      });
    });

    it("DELETE - should delete the user successfully", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.validateDetailsResponse(
          () => cy.userService.deleteUser(userData.username),
          200,
          "OK",
          true,
        ).then((res) => {
          const responseBody = res.body;

          expect(responseBody).to.be.an("object");
          expect(responseBody).to.have.property("code", 200);
          expect(responseBody).to.have.property("type");
          expect(responseBody.message).to.eq(userData.username);
        });

        cy.userService.getUserByUsername(userData.username).then((getRes) => {
          expect(getRes.status).to.eq(404);
        });
      });
    });

    it("GET - should login successfully with valid credentials", () => {
      cy.fixture("user/user.json").then((userData) => {
        cy.userService.createUser(userData).then((createRes) => {
          expect(createRes.status).to.eq(200);

          cy.userService
            .login(userData.username, userData.password)
            .then((loginRes) => {
              expect(loginRes.status).to.eq(200);
              expect(loginRes.body).to.be.an("object");
              expect(loginRes.body).to.have.property("code", 200);
              expect(loginRes.body).to.have.property("type");
              expect(loginRes.body).to.have.property("message");

              expect(loginRes.headers).to.have.property("x-expires-after");
              expect(loginRes.headers).to.have.property("x-rate-limit");
            })
            .then(() => {
              return cy.userService.deleteUser(userData.username);
            })
            .then((deleteRes) => {
              expect(deleteRes.status).to.eq(200);
            });
        });
      });
    });

    it("GET - should logout successfully", () => {
      cy.userService.logout().then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(200);
      });
    });

    it("POST - should create users with an array successfully", () => {
      cy.fixture("user/usersArray.json").then((usersData) => {
        cy.userService.createUsersWithArray(usersData).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("type");
          expect(res.body).to.have.property("message", "ok");
        });

        usersData.forEach((userData) => {
          cy.userService.getUserByUsername(userData.username).then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body).to.have.property("id", userData.id);
            expect(getRes.body).to.have.property("username", userData.username);
            expect(getRes.body).to.have.property(
              "firstName",
              userData.firstName,
            );
            expect(getRes.body).to.have.property("lastName", userData.lastName);
            expect(getRes.body).to.have.property("email", userData.email);
          });
        });

        usersData.forEach((userData) => {
          cy.userService.deleteUser(userData.username).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
        });
      });
    });

    it("POST - should create users with a list successfully", () => {
      cy.fixture("user/usersList.json").then((usersData) => {
        cy.userService.createUsersWithList(usersData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("type");
          expect(res.body).to.have.property("message", "ok");
        });

        usersData.forEach((userData) => {
          cy.userService.getUserByUsername(userData.username).then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body).to.have.property("id", userData.id);
            expect(getRes.body).to.have.property("username", userData.username);
            expect(getRes.body).to.have.property(
              "firstName",
              userData.firstName,
            );
            expect(getRes.body).to.have.property("lastName", userData.lastName);
            expect(getRes.body).to.have.property("email", userData.email);
          });
        });

        usersData.forEach((userData) => {
          cy.userService.deleteUser(userData.username).then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
        });
      });
    });
  });
});

describe("User API - Negative Scenarios", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("GET - should return 404 for a non-existent user", () => {
      const username = "cypress_user_not_found_9999";

      cy.userService.getUserByUsername(username).then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(404);
        expect(res.body).to.have.property("code", 1);
        expect(res.body).to.have.property("type", "error");
        expect(res.body).to.have.property("message", "User not found");
      });
    });

    it("GET - should document API behavior for invalid login credentials", () => {
      const username = "cypress_user_invalid_9999";
      const password = "WrongPassword123!";

      cy.userService.login(username, password).then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("object");
        expect(res.body).to.have.property("code", 200);
        expect(res.body).to.have.property("type", "unknown");
        expect(res.body.message).to.be.a("string");
        expect(res.body.message).to.include("logged in user session:");
      });
    });

    it("DELETE - should return 404 for a non-existent user", () => {
      const username = "cypress_user_delete_not_found_9999";

      cy.userService.deleteUser(username).then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(404);
        expect(res.body).to.eq("");
      });
    });

    it("PUT - should investigate updating a non-existent user", () => {
      cy.fixture("user/nonExistentUser.json").then((userData) => {
        cy.userService
          .updateUser(userData.username, userData)
          .then((res) => {
            cy.log(`HTTP status: ${res.status}`);
            cy.log(`Response body: ${JSON.stringify(res.body)}`);

            expect(res.status).to.eq(200);
            expect(res.body).to.have.property("code", 200);
            expect(res.body).to.have.property("message", String(userData.id));

            return cy.userService.getUserByUsername(userData.username);
          })
          .then((getRes) => {
            expect(getRes.status).to.eq(200);
            expect(getRes.body).to.have.property("id", userData.id);
            expect(getRes.body).to.have.property("username", userData.username);
            expect(getRes.body).to.have.property(
              "firstName",
              userData.firstName,
            );

            return cy.userService.deleteUser(userData.username);
          })
          .then((deleteRes) => {
            expect(deleteRes.status).to.eq(200);
          });
      });
    });

    it("POST - should investigate creating a user with invalid data types", () => {
      cy.fixture("user/invalidUser.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(500);
          expect(res.body).to.deep.equal({
            code: 500,
            type: "unknown",
            message: "something bad happened",
          });
        });
      });
    });

    it("POST - should investigate creating a user with a partial body", () => {
      cy.fixture("user/partialUser.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("message", String(userData.id));

          return cy.userService
            .getUserByUsername(userData.username)
            .then((getRes) => {
              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property("id", userData.id);
              expect(getRes.body).to.have.property(
                "username",
                userData.username,
              );

              return cy.userService
                .deleteUser(userData.username)
                .then((deleteRes) => {
                  expect(deleteRes.status).to.eq(200);
                });
            });
        });
      });
    });

    it("POST - should investigate creating a user with a string ID", () => {
      cy.fixture("user/stringUserId.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(500);
          expect(res.body).to.deep.equal({
            code: 500,
            type: "unknown",
            message: "something bad happened",
          });
        });
      });
    });

    it("POST - should reject a user with an invalid status", () => {
      cy.fixture("user/invalidUserStatus.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(500);
          expect(res.body).to.deep.equal({
            code: 500,
            type: "unknown",
            message: "something bad happened",
          });
        });
      });
    });
  });
});

describe("User API - Edge Cases and API Behavior", () => {
  context("REST Feature", { tags: "rest" }, () => {
    it("GET - should return 404 for a username with special characters", () => {
      const username = "invalid user!@#";

      cy.userService.getUserByUsername(username).then((res) => {
        cy.log(`HTTP status: ${res.status}`);
        cy.log(`Response body: ${JSON.stringify(res.body)}`);

        expect(res.status).to.eq(404);
      });
    });

    it("POST - should investigate creating a user with an empty username", () => {
      cy.fixture("user/emptyUsernameUser.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.be.oneOf([200, 400, 500]);

          if (res.status === 200) {
            expect(res.body).to.have.property("code", 200);
            expect(res.body).to.have.property("message", String(userData.id));

            return cy.userService
              .getUserByUsername(userData.username)
              .then((getRes) => {
                cy.log(`GET HTTP status: ${getRes.status}`);
                cy.log(`GET response body: ${JSON.stringify(getRes.body)}`);

                return cy.userService
                  .deleteUser(userData.username)
                  .then((deleteRes) => {
                    cy.log(`DELETE HTTP status: ${deleteRes.status}`);
                    cy.log(
                      `DELETE response body: ${JSON.stringify(deleteRes.body)}`,
                    );
                  });
              });
          }
        });
      });
    });

    it("POST - should investigate creating a user with an empty email", () => {
      cy.fixture("user/emptyEmailUser.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("message", String(userData.id));

          return cy.userService
            .getUserByUsername(userData.username)
            .then((getRes) => {
              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property("email", "");

              return cy.userService.deleteUser(userData.username);
            })
            .then((deleteRes) => {
              expect(deleteRes.status).to.eq(200);
            });
        });
      });
    });

    it("POST - should investigate creating a user with an empty password", () => {
      cy.fixture("user/emptyPasswordUser.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("message", String(userData.id));

          return cy.userService
            .getUserByUsername(userData.username)
            .then((getRes) => {
              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property("password", "");

              return cy.userService.deleteUser(userData.username);
            })
            .then((deleteRes) => {
              expect(deleteRes.status).to.eq(200);
            });
        });
      });
    });

    it("POST - should accept a user with a negative status", () => {
      cy.fixture("user/negativeUserStatus.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("code", 200);
          expect(res.body).to.have.property("message", String(userData.id));

          return cy.userService
            .getUserByUsername(userData.username)
            .then((getRes) => {
              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property(
                "userStatus",
                userData.userStatus,
              );

              return cy.userService.deleteUser(userData.username);
            })
            .then((deleteRes) => {
              expect(deleteRes.status).to.eq(200);
            });
        });
      });
    });

    it("POST - should investigate creating a user with a negative ID", () => {
      cy.fixture("user/negativeUserId.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("code", 200);
          expect(res.body.message).to.be.a("string").and.not.be.empty;

          const returnedId = res.body.message;

          return cy.userService
            .getUserByUsername(userData.username)
            .then((getRes) => {
              cy.log(`GET response body: ${JSON.stringify(getRes.body)}`);

              expect(getRes.status).to.eq(200);
              expect(getRes.body).to.have.property(
                "username",
                userData.username,
              );

              const retrievedId = String(getRes.body.id);

              if (retrievedId !== returnedId) {
                cy.log(
                  `ID representation mismatch. POST returned: ${returnedId}; GET returned: ${retrievedId}`,
                );
              }

              return cy.userService.deleteUser(userData.username);
            })
            .then((deleteRes) => {
              expect(deleteRes.status).to.eq(200);
            });
        });
      });
    });

    it("POST - should investigate creating a user with a whitespace-only username", () => {
      cy.fixture("user/whitespaceUsernameUser.json").then((userData) => {
        cy.userService.createUser(userData).then((res) => {
          cy.log(`HTTP status: ${res.status}`);
          cy.log(`Response body: ${JSON.stringify(res.body)}`);

          expect(res.status).to.eq(200);
          expect(res.body).to.have.property("code", 200);
          expect(res.body.message).to.be.a("string").and.not.be.empty;

          return cy.userService
            .getUserByUsername(userData.username)
            .then((getRes) => {
              cy.log(`GET HTTP status: ${getRes.status}`);
              cy.log(`GET response body: ${JSON.stringify(getRes.body)}`);

              if (getRes.status === 200) {
                return cy.userService
                  .deleteUser(userData.username)
                  .then((deleteRes) => {
                    cy.log(`DELETE HTTP status: ${deleteRes.status}`);
                    expect(deleteRes.status).to.eq(200);
                  });
              }

              cy.log(
                `Cleanup could not be completed through this flow. GET returned HTTP ${getRes.status}.`,
              );
            });
        });
      });
    });
  });
});
