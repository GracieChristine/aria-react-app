describe('Profile', () => {
  const ts = Date.now();
  const email       = `profile-user-${ts}@aria.com`;
  const newEmail    = `updated-profile-user-${ts}@aria.com`;
  const password    = 'Password123!';
  const newPassword = 'NewPassword123!';

  before(() => {
    cy.request('POST', '/api/auth/register', {
      firstName: 'Profile',
      lastName:  'User',
      email,
      password,
    });
  });

  describe('Access control', () => {
    it('should redirect unauthenticated users from /profile to /login @smoke', () => {
      cy.clearLocalStorage();
      cy.visit('/profile');
      cy.url().should('eq', Cypress.config('baseUrl') + '/login');
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('should navigate to /profile when clicking the navbar name link @smoke', () => {
      cy.contains('nav a', 'Profile User').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/profile');
    });
  });

  describe('Profile section', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.visit('/profile');
    });

    it('should display profile in read-only view by default @smoke', () => {
      cy.contains('button', 'Edit').should('be.visible');
      cy.get('form').should('not.exist');
      cy.contains('span', 'Profile User').should('be.visible');
      cy.contains('span', email).should('be.visible');
    });

    it('should switch to edit mode when Edit is clicked', () => {
      cy.contains('button', 'Edit').click();

      cy.contains('button', 'Edit').should('not.exist');
      cy.get('form').should('be.visible');
      cy.contains('label', 'First name').parent().find('input').should('have.value', 'Profile');
      cy.contains('label', 'Last name').parent().find('input').should('have.value', 'User');
      cy.contains('label', 'Email address').parent().find('input').should('have.value', email);
      cy.contains('label', 'Phone').parent().find('input').should('have.value', '');
      cy.contains('label', 'Bio').parent().find('textarea').should('have.value', '');
    });

    // NOTE: the following 4 validation tests require client-side validation to be
    // added to ProfilePage.jsx before they will pass
    it('should show an error if first name is empty', () => {
      cy.contains('button', 'Edit').click();

      cy.contains('label', 'First name').parent().find('input').clear();
      cy.contains('button', 'Save changes').click();

      cy.contains('First name is required.').should('be.visible');
    });

    it('should show an error if last name is empty', () => {
      cy.contains('button', 'Edit').click();

      cy.contains('label', 'Last name').parent().find('input').clear();
      cy.contains('button', 'Save changes').click();
      cy.contains('Last name is required.').should('be.visible');
    });

    it('should show an error if email is empty', () => {
      cy.contains('button', 'Edit').click();

      cy.contains('label', 'Email address').parent().find('input').clear();
      cy.contains('button', 'Save changes').click();

      cy.contains('Email is required.').should('be.visible');
    });

    it('should show an error if email is invalid', () => {
      cy.contains('button', 'Edit').click();

      cy.contains('label', 'Email address').parent().find('input').clear().type('notanemail');
      cy.contains('button', 'Save changes').click();

      cy.contains('Please enter a valid email address.').should('be.visible');
    });

    it('should return to read-only view when Cancel is clicked', () => {
      cy.contains('button', 'Edit').click();

      cy.contains('label', 'First name').parent().find('input').clear().type('Changed');
      cy.contains('button', 'Cancel').click();

      cy.get('form').should('not.exist');
      cy.contains('button', 'Edit').should('be.visible');
      cy.contains('span', 'Profile User').should('be.visible');
    });

    it('should save profile changes and update the navbar name @smoke', () => {
      cy.contains('button', 'Edit').click();
      
      cy.contains('label', 'First name').parent().find('input').clear().type('Updated');
      cy.contains('label', 'Email address').parent().find('input').clear().type(newEmail);
      cy.contains('label', 'Phone').parent().find('input').clear().type('555-555-5555');
      cy.contains('label', 'Bio').parent().find('textarea').clear().type("I'm just a test user.");
      cy.contains('button', 'Save changes').click();

      cy.get('form').should('not.exist');
      cy.contains('span', 'Updated User').should('be.visible');
      cy.contains('span', newEmail).should('be.visible');
      cy.contains('span', '555-555-5555').should('be.visible');
      cy.contains('a', 'Hi, Updated User').should('be.visible');

      cy.contains('button', 'Logout').click();
      cy.visit('/login');
      cy.get('input[name="email"]').type(newEmail);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('a', 'Hi, Updated User').should('be.visible');
    });
  });

  describe('Password section', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(newEmail);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.visit('/profile');
      cy.contains('button', 'Password').click();
    });

    // NOTE: the following 3 validation tests require client-side validation to be
    // added to ProfilePage.jsx before they will pass
    it('should show an error if current password is empty', () => {
      cy.contains('label', 'New password').parent().find('input').clear().type('NewPassword123!');
      cy.contains('label', 'Confirm new password').parent().find('input').clear().type('NewPassword123!');
      cy.contains('button', 'Update password').click();

      cy.contains('Current password is required.').should('be.visible');
    });

    it('should show an error if new password is empty', () => {
      cy.contains('label', 'Current password').parent().find('input').clear().type(password);
      cy.contains('label', 'Confirm new password').parent().find('input').clear().type('NewPassword123!');
      cy.contains('button', 'Update password').click();

      cy.contains('New password is required.').should('be.visible');
    });

    it('should show an error if new password is less than 8 characters', () => {
      cy.contains('label', 'Current password').parent().find('input').clear().type(password);
      cy.contains('label', 'New password').parent().find('input').clear().type('short');
      cy.contains('label', 'Confirm new password').parent().find('input').clear().type('short');
      cy.contains('button', 'Update password').click();

      cy.contains('Password must be at least 8 characters.').should('be.visible');
    });

    it('should show an error if confirm password is empty', () => {
      cy.contains('label', 'Current password').parent().find('input').clear().type(password);
      cy.contains('label', 'New password').parent().find('input').clear().type(newPassword);
      cy.contains('button', 'Update password').click();

      cy.contains('Please confirm your new password.').should('be.visible');
    });

    it('should show an error if new passwords do not match', () => {
      cy.contains('label', 'Current password').parent().find('input').clear().type(password);
      cy.contains('label', 'New password').parent().find('input').clear().type(newPassword);
      cy.contains('label', 'Confirm new password').parent().find('input').clear().type('123NewPassword!');
      cy.contains('button', 'Update password').click();

      cy.contains('New passwords do not match.').should('be.visible');
    });

    it('should show an error if current password is incorrect @smoke', () => {
      cy.contains('label', 'Current password').parent().find('input').clear().type('123Password!');
      cy.contains('label', 'New password').parent().find('input').clear().type(newPassword);
      cy.contains('label', 'Confirm new password').parent().find('input').clear().type(newPassword);
      cy.contains('button', 'Update password').click();

      cy.contains('Current password is incorrect.').should('be.visible');
    });

    it('should successfully update the password @smoke', () => {
      cy.contains('label', 'Current password').parent().find('input').clear().type(password);
      cy.contains('label', 'New password').parent().find('input').clear().type(newPassword);
      cy.contains('label', 'Confirm new password').parent().find('input').clear().type(newPassword);
      cy.contains('button', 'Update password').click();

      cy.contains('Password updated successfully.').should('be.visible');

      cy.contains('button', 'Logout').click();
      cy.visit('/login');
      cy.get('input[name="email"]').type(newEmail);
      cy.get('input[name="password"]').type(newPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.contains('a', 'Hi, Updated User').should('be.visible');
    });
  });

  // NOTE: the following need to be implement first before this can be tested.
  describe('Become a host section', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('input[name="email"]').type(newEmail);
      cy.get('input[name="password"]').type(newPassword);
      cy.get('button[type="submit"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
      cy.visit('/profile');
      cy.contains('button', 'Become a host').click();
    });
    it('', () => {});
  });
});
