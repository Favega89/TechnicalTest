Cypress.Commands.add('createUser', (userData, method = 'POST') => {
    return cy.fixture('config.json').then(config => {
        return cy.apiRequest(method, config.rootUrl + "api/auth/register", userData).then(response => {
            return response.body;
        });
    });
});


Cypress.Commands.add('apiRequest', (method, url, body) => {
    return cy.request({
        method: method,
        url: url,
        body: body,
    }).then((response) => {
        return response;
    });
});