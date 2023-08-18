Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

describe('template spec', () => {
  it('passes', () => {
    cy.visit('/')
    cy.wait(5000)
  })
})