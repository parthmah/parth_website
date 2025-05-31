describe('Website Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the home page', () => {
    cy.title().should('include', 'Parth Maheshwari');
    cy.get('h1').should('contain', 'Parth Maheshwari');
  });

  it('should navigate to photos page', () => {
    cy.get('a[href="/photos"]').click();
    cy.url().should('include', '/photos');
    cy.get('.gallery-grid').should('exist');
  });

  it('should toggle theme', () => {
    cy.get('body').should('not.have.attr', 'data-theme', 'dark');
    cy.get('button[aria-label="Toggle theme"]').click();
    cy.get('body').should('have.attr', 'data-theme', 'dark');
  });

  it('should have working social links', () => {
    cy.get('a[href*="twitter.com"]').should('have.attr', 'target', '_blank');
    cy.get('a[href*="linkedin.com"]').should('have.attr', 'target', '_blank');
    cy.get('a[href*="github.com"]').should('have.attr', 'target', '_blank');
  });

  it('should handle 404 page', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false });
    cy.url().should('include', '/404.html');
    cy.get('.notfound-emoji').should('exist');
  });
}); 