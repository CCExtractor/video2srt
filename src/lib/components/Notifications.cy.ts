import Notifications from "./Notifications.svelte";

describe('Testing Notification button if it shows up', () => {
  it('Check if button is there', () => {
    cy.mount(Notifications)
    cy.get('button').contains('Subscribe to Notifications')
  })

  it('Check if auto reject', () => {
    cy.mount(Notifications)
    cy.get('button').click().contains('Notifications denied');
  })

  it('Check if no button shows up', () => {
    cy.visit('index.html')
  })

})


