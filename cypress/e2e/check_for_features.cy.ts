Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })
  
  describe('Test if Features are present', () => {
    it('Site Loads', () => {
      cy.visit('/')
    })

    it('Contains Models', () => {
      cy.visit('/')
      cy.get('body').find('#models-selector')
    });

    it('Contains Title', () => {
        cy.visit('/')
        cy.contains('Video 2 SRT')

    })

    it('Contains Fork', () => {
      cy.visit('/')
      cy.contains('Fork')

    })

    it('Contains Delete Models Button', () => {
      cy.visit('/')
      cy.get('body').find('#delete-models-button').contains('Delete Models')
    })

    it('Contains File Upload', () => {
      cy.visit('/')
      cy.get('body').find("input[type='file']")
    })

    it('Contains Convert Button', () => {
      cy.visit('/')
      cy.get('body').find('#convert-button').contains('Convert')
    })

    it('Contains Slider', () => {
      // Check if the Slider is Present
      cy.visit('/')
      cy.get('body').find('#stepper').should('have.value', 16)

      // Check if it reflects the label
      cy.get('body').find('#label-stepper').should('have.text', 'Threads in use: 16')

      // Set value
      cy.get('#stepper').invoke('val', 2).trigger('change')
      cy.get('body').find('#label-stepper').should('have.text', 'Threads in use: 2')
    })

    it('Contains Language Selector', () => {
      // Check if the language field is present
      cy.visit('/')
      cy.get('body').find('#languages').should('have.value', 'en')

      // Check if the Checkbox shows up
      cy.get('#languages').select('mk').should('have.value', 'mk')
      cy.get('body').find("input[type='checkbox']")

    })

    it('Check for a notification button', () => {
      // Check if present with notifications
      cy.visit('/')
      cy.get('body').find("#subscribe-notifications-button").contains('Subscribe to Notifications')
    })
  })