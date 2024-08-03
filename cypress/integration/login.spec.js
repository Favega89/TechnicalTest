import { loginLocators } from "../fixtures/locators/login.json"
import { homeLocators } from "../fixtures/locators/homepage.json"
import { categoriesLocators } from "../fixtures/locators/categories.json"

describe('E2E - Qubika Sports Club Management System', () => {

  let responseApi
  let emailBuilt

  before(() => {
    cy.fixture('input/create_user_data.json').then(userData => {
      const [body, domain] = userData.email.split('@');
      emailBuilt = body + `${Date.now()}@` + domain
      userData.email = emailBuilt
      cy.createUser(userData).then(response => {
        responseApi = response
        cy.writeFile('cypress/fixtures/responses/user.json', response);
      });
    });
  });

  it('should create a new user successfully', () => {
    cy.fixture('input/create_user_data.json').then(userData => {
      expect(responseApi).to.have.property('id');
      expect(responseApi).to.have.property('email', emailBuilt);
      expect(responseApi.roles).to.include(userData.roles[0]);
      expect(responseApi).to.have.property('firstName', null);
      expect(responseApi).to.have.property('lastName', null);
      expect(responseApi).to.have.property('fullName', null);
    });
  });

  describe('UI Login Tests', () => {

    beforeEach(() => {
      cy.fixture('config.json').then(config => {
        cy.visit(config.loginPage);
      });
    });

    it('login - url validation', () => {
      cy.url().should('include', '/auth/login')
    });

    it('login - page elements validations', () => {
      cy.get('h3').should('contain', 'Qubika Club').and('be.visible')
      cy.get('small').should('contain', 'Por favor ingrese correo y contraseña').and('be.visible')
      cy.get(loginLocators.textBoxIcon).eq(0).should('have.class', loginLocators.emailIconClass).and('be.visible')
      cy.get(loginLocators.textBoxIcon).eq(1).should('have.class', loginLocators.lockIconClass).and('be.visible')
      cy.get(loginLocators.emailTextBox).should('be.visible')
      cy.get(loginLocators.passwordTextBox).should('be.visible')
      cy.get(loginLocators.customControlCheckbox).should('exist').and('have.css', 'opacity', '0')
      // class customCheckLogin is called " customCheckLogin" space at beginning breaks with locator finding
      // not posible to validate is visible for this element , opacity 0% independently that it is detectable cause of square from outside element
      cy.get(loginLocators.customControlLabel).should('be.visible').and('contain', 'Recordarme')
      cy.get('.btn').should('be.visible')
        .and('have.text', 'Autenticar')
        .and('be.disabled')
    });

    it('login - happy path', () => {
      let url;
      cy.fixture('config.json').then(config => {
        url = config.rootUrl + '/api/auth/login';
      });
      cy.fixture('input/create_user_data.json').then(userData => {
        cy.intercept('POST', url).as('login');
        cy.get(loginLocators.emailTextBox).type(userData.email)
        cy.get(loginLocators.passwordTextBox).type(userData.password)
        cy.get('.btn').click()
        cy.wait('@login').then((call) => {
          expect(call.response.statusCode).to.eq(200)
        });
      });
    });
  });

  describe('UI Categories Tests', () => {

    let myCategoryName = "my_new_test_cattegory"
    let category
    let categoryFound = false;

    beforeEach(() => {
      cy.fixture('config.json').then(config => {
        cy.visit(config.loginPage);
      });
      cy.fixture('input/create_user_data.json').then(userData => {
        cy.get(loginLocators.emailTextBox).type(userData.email)
        cy.get(loginLocators.passwordTextBox).type(userData.password)
        cy.get('.btn').click()
      });
    });

    it('categories - add - happy path', () => {
      cy.viewport(1920, 1080);
      cy.get(homeLocators.categoriesMenuBtn).click()
      cy.get(categoriesLocators.addCategoryBtn).click()
      cy.get(categoriesLocators.nameTextBox).should('be.visible').type(myCategoryName)
      cy.get(categoriesLocators.acceptBtn).click()
      cy.get(".page-link").should('be.visible');
      cy.get(".page-link").then(($pages) => {
        for (let i = 2; i <= $pages.length; i++) {
          cy.log("lenght")
          cy.log($pages.length)
          cy.get('tbody > tr').should('be.visible').then(($rows) => {
            const rowsArray = [...$rows];
            rowsArray.forEach((row) => {
              category = Cypress.$(row).find(':nth-child(1)').text().replace("ModificarEliminarModificar", "")
              cy.log(category)
              cy.log(myCategoryName)
              if (category.includes(myCategoryName)) {
                categoryFound = true
              }
            });
          });
          cy.get(`:nth-child(${i}) > .page-link`).click();
        }
      }).then(() => {
        expect(categoryFound).to.be.true;
      });
    });
  });
});



