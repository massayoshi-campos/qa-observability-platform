cy.userService = {
  createUser: (userData) => {
    return cy.apiKeyRequestWithJsonBody("POST", "user", userData);
  },

  getUserByUsername: (username) => {
    return cy.apiKeyRequest("GET", `user/${username}`);
  },

  updateUser: (username, userData) => {
    return cy.apiKeyRequestWithJsonBody("PUT", `user/${username}`, userData);
  },

  deleteUser: (username) => {
    return cy.apiKeyRequest("DELETE", `user/${username}`);
  },

  login: (username, password) => {
    return cy.apiKeyRequest(
      "GET",
      `user/login?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
    );
  },

  logout: () => {
    return cy.apiKeyRequest("GET", "user/logout");
  },

  createUsersWithArray: (usersData) => {
    return cy.apiKeyRequestWithJsonBody(
      "POST",
      "user/createWithArray",
      usersData,
    );
  },

  createUsersWithList: (usersData) => {
    return cy.apiKeyRequestWithJsonBody(
      "POST",
      "user/createWithList",
      usersData,
    );
  },
};
