describe('Auth', () => {
  const ts = Date.now();

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit(Cypress.config('baseUrl') + '/');
  });

  describe('Register', () => {

    beforeEach(() => {
      cy.contains('a', 'Sign up').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/register');

    });
    // Required field missing input
    it('should error out if required full name missing', () => {
      cy.get('input[name="name"]').clear();
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Name is required.');
    });

    it('should error out if required email missing', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').clear();
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Email is required.');
    });

    it('should error out if required password missing', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').clear();
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Password is required.');
    });

    it('should error out if required confirm password missing', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').clear();
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Please confirm your password.');
    });

    // Required field with invalid input
    it('should error out if email is invalid', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Please enter a valid email address.');
    });

    it('should error out if password is less than 8 characters', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('short');
      cy.get('input[name="confirmPassword"]').type('short!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Password must be at least 8 characters.');
    });

    it('should error out if confirm password not matching', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('123Password!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Passwords do not match.');
    });

    // User is register
    it('should register a new user and redirect to home @smoke', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('nav button', 'New User').should('be.visible');
    });

    // User exist already
    it('should error out if user is already registered @smoke', () => {
      cy.get('input[name="name"]').type('New User');
      cy.get('input[name="email"]').type(`new-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/register');
      cy.contains('New User').should('not.exist');
      cy.contains('Email already registered. Try logging in.');
    });
  });

  describe('Login', () => {

    before(() => {
      cy.request('POST', '/api/auth/register', {
        firstName: 'Register', lastName: 'User',
        email: `register-user-${ts}@aria.com`, password: 'Password123!'
      });
    });

    beforeEach(() => {
      cy.get('nav').contains('a', 'Log in').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
    });

    // Required field missing input
    it('should error out if required email missing', () => {
      cy.get('input[name="email"]').clear();
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
      cy.contains('Register User').should('not.exist');
      cy.contains('Email is required.');
    });

    it('should error out if required password missing', () => {
      cy.get('input[name="email"]').type(`register-user-${ts}@aria.com`);
      cy.get('input[name="password"]').clear();
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
      cy.contains('Register User').should('not.exist');
      cy.contains('Password is required.');
    });

    // Required field with invalid input
    it('should error out if email is invalid', () => {
      cy.get('input[name="email"]').type(`register-user-${ts}@`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
      cy.contains('Register User').should('not.exist');
      cy.contains('Please enter a valid email address.');
    });

    it('should error out if password is incorrect @smoke', () => {
      cy.get('input[name="email"]').type(`register-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('123Password!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
      cy.contains('Register User').should('not.exist');
      cy.contains('Incorrect password. Please try again.');
    });

    // User isn't register yet
    it('should error out if user isn\'t register yet', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type(`unregister-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
      cy.contains('Unregister User').should('not.exist');
      cy.contains('No account found with this email. Try registering.');
    });

    // User is login
    it('should login as a user and redirect to home @smoke', () => {
      cy.get('input[name="email"]').type(`register-user-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Register User').should('be.visible');
    });
  });

  describe('Logout', () => {
    it('should logout as a login user and redirect to home @smoke', () => {
      cy.visit('/register');

      cy.get('input[name="name"]').type('Test User 1');
      cy.get('input[name="email"]').type(`test-user-1-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Test User 1').should('be.visible');

      cy.contains('nav button', 'Test User 1').click();
      cy.contains('button', 'Log out').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Log in').should('be.visible');
      cy.contains('Sign up').should('be.visible');
    });

    it('should logout as a new registered user and redirect to home', () => {
      cy.visit('/register');

      cy.get('input[name="name"]').type('Test User 2');
      cy.get('input[name="email"]').type(`test-user-2-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('input[name="confirmPassword"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Test User 2').should('be.visible');

      cy.contains('nav button', 'Test User 2').click();
      cy.contains('button', 'Log out').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Log in').should('be.visible');
      cy.contains('Sign up').should('be.visible');

      cy.visit('/login');

      cy.get('input[name="email"]').type(`test-user-2-${ts}@aria.com`);
      cy.get('input[name="password"]').type('Password123!');
      cy.get('button[type="submit"]').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Test User 2').should('be.visible');

      cy.contains('nav button', 'Test User 2').click();
      cy.contains('button', 'Log out').click();

      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('Log in').should('be.visible');
      cy.contains('Sign up').should('be.visible');
    });
  });
});
