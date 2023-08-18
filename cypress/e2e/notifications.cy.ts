Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    return false
  })

  describe('Test if Features are present', () => {
    it('Notifications Denied', () => {
        cy.visit('/', {
            onBeforeLoad (win) {
            cy.stub(win.Notification, 'permission', 'denied')
            cy.stub(win.Notification, 'requestPermission').resolves('denied').as('ask')
            cy.stub(win, 'Notification').as('Notification')
            },
        })
        cy.get('#subscribe-notifications-button').contains("Notifications denied")
    })

    it('Ask for Permission', () => {
        cy.visit('index.html', {
          onBeforeLoad (win) {
            cy.stub(win.Notification, 'permission', 'unknown')
            cy.stub(win.Notification, 'requestPermission').resolves('granted').as('ask')
            cy.stub(win, 'Notification').as('Notification')
          },
        })
      
        cy.get('#subscribe-notifications-button').click()
        cy.get('@ask').should('have.been.calledOnce')
        cy.get('#subscribe-notifications-button').should('not.exist');
      })

    it('Permission Previously Granted', () => {
        // see cy.visit options in https://on.cypress.io/visit
        cy.visit('index.html', {
          onBeforeLoad (win) {
            // https://on.cypress.io/stub
            cy.stub(win.Notification, 'permission', 'granted')
            cy.stub(win, 'Notification').as('Notification')
          },
        })

        cy.get('#subscribe-notifications-button').should('not.exist');

    });
    
    it('shows alert if the browser does not support notifications', () => {
        cy.visit('/', {
          onBeforeLoad (win) {
            delete win.Notification
          },
        })

        cy.get('#subscribe-notifications-button').should('not.exist');

      })

  })