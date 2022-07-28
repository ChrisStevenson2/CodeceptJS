import path = require('path');
const featureName: string = path.parse(__filename).name;

import { TestContext } from '../../../library/testcontext/testcontext';
import { TestName } from '../../../library/testname';

Feature('Web Client');

/**
 * Validates navigation to the Messaging page and basic render
 */
Scenario(TestName.generate(featureName, 'Messaging BVT'), ({I, CXE, ClientAPI, SoapAPI}) => {
    CXE.goto.loginPage();
    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);

    CXE.goto.messagingPage();
    CXE.messagingPage.verifyPage();
});

/**
 * Validates Messaging page elements
 */

Scenario(TestName.generate(featureName, 'Validate Page Elements'), async ({ I, CXE }) => {

    CXE.goto.loginPage();
    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);
    
    // Navigating to Messaging page and validating the elements for the page.
    CXE.goto.messagingPage();

    I.seeElement(CXE.messagingPage.pageTitle);
    I.seeElement(CXE.messagingPage.saveButtonDisabled);
    I.seeElement(CXE.messagingPage.cancelButtonDisabled);

    I.seeElement(CXE.messagingPage.playEnvelopeNo);
    I.seeElement(CXE.messagingPage.playEnvelopeBefore);
    I.seeElement(CXE.messagingPage.playEnvelopeAfter);

    I.seeElement(CXE.messagingPage.dateTimeSenderDisabled);
    I.seeElement(CXE.messagingPage.dateTimeOnlyDisabled);

    I.seeElement(CXE.messagingPage.playFirstMessage);
    I.seeElement(CXE.messagingPage.sortUrgentFirst);
    I.seeElement(CXE.messagingPage.listenByType);

    I.seeElement(CXE.messagingPage.oldestFirst);
    I.seeElement(CXE.messagingPage.mostRecentFirst);

    I.seeElement(CXE.messagingPage.playbackSpeedMessageOnly);
    I.seeElement(CXE.messagingPage.playbackSpeedSessionOnly);
    I.seeElement(CXE.messagingPage.playbackSpeedPersistAll);
    I.seeElement(CXE.messagingPage.playbackSpeedControlDisabled);
    I.seeElement(CXE.messagingPage.resetNormalButtonDisabled);
    
});

/**
 * Validates Save | Cancel buttons enable and disable functionality
 */

Scenario(TestName.generate(featureName, 'Save | Cancel buttons enabled and disabled'), async ({ I, CXE }) => {

    CXE.goto.loginPage();
    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);
    
    CXE.goto.messagingPage();
    
    // Ensure save and cancel button are disabled
    I.seeElement(CXE.messagingPage.saveButtonDisabled);
    I.seeElement(CXE.messagingPage.cancelButtonDisabled);
    
    // Change the state of a field
    I.checkOption(CXE.messagingPage.playEnvelopeBefore);

    // Ensure save and cancel button are enabled
    I.seeElement(CXE.messagingPage.saveButtonEnabled);
    I.seeElement(CXE.messagingPage.cancelButtonEnabled);

});

/**
 * Test for validating the changes get saved
 */

Scenario(TestName.generate(featureName, 'Verify changes get saved'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();
    
    // Modify and save the changes
    I.checkOption(CXE.messagingPage.playEnvelopeBefore);
    I.checkOption(CXE.messagingPage.playFirstMessage);
    I.checkOption(CXE.messagingPage.sortUrgentFirst);
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeCheckboxIsChecked(CXE.messagingPage.playEnvelopeBefore);
    I.dontSeeElement(CXE.messagingPage.dateTimeSenderDisabled)
    I.dontSeeElement(CXE.messagingPage.dateTimeOnlyDisabled);

    I.seeCheckboxIsChecked(CXE.messagingPage.playFirstMessage);
    I.seeCheckboxIsChecked(CXE.messagingPage.sortUrgentFirst);

});

/**
 * Cancel the changes and verify the previous value/state is restored
 */

Scenario(TestName.generate(featureName, 'Verify on cancel the previous value/state is restored'), async ({ I, CXE }) => {

    CXE.goto.loginPage();
    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);

    CXE.goto.messagingPage();

    //Validating initial state
    I.seeCheckboxIsChecked(CXE.messagingPage.playbackSpeedSessionOnly);
    I.seeElement(CXE.messagingPage.playbackSpeedControlDisabled);
    I.seeElement(CXE.messagingPage.saveButtonDisabled);
    I.seeElement(CXE.messagingPage.cancelButtonDisabled);

    // Modify and cancel the changes
    I.checkOption(CXE.messagingPage.playbackSpeedPersistAll);
    I.dontSeeElement(CXE.messagingPage.playbackSpeedControlDisabled);

    I.dragSlider(CXE.messagingPage.playbackSpeedControl, 50);

    I.click(CXE.messagingPage.cancelButton);

    //verifying the previous value/state is restored
    I.seeCheckboxIsChecked(CXE.messagingPage.playbackSpeedSessionOnly);
    I.dontSeeCheckboxIsChecked(CXE.messagingPage.playbackSpeedPersistAll);
    I.seeElement(CXE.messagingPage.playbackSpeedControlDisabled);
    I.seeElement(CXE.messagingPage.saveButtonDisabled);
    I.seeElement(CXE.messagingPage.cancelButtonDisabled);

});

/**
 * Test for changing the default value for "Play envelope automatically
 */

 Scenario(TestName.generate(featureName, 'Change default value for Play envelope automatically and save'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();
    
    // Validating default is checked
    I.seeCheckboxIsChecked(CXE.messagingPage.playEnvelopeNo);
    I.seeElement(CXE.messagingPage.dateTimeSenderDisabled);
    I.seeElement(CXE.messagingPage.dateTimeOnlyDisabled);

    //Change the default value and save
    I.checkOption(CXE.messagingPage.playEnvelopeBefore);
    I.seeElement(CXE.messagingPage.dateTimeSenderEnabled);
    I.seeElement(CXE.messagingPage.dateTimeOnlyEnabled);
    
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeCheckboxIsChecked(CXE.messagingPage.playEnvelopeBefore);
    I.seeElement(CXE.messagingPage.dateTimeSenderEnabled);
    I.seeElement(CXE.messagingPage.dateTimeOnlyEnabled);

});

/**
 * Test for changing the default value for "Envelope content when played automatically
 */

 Scenario(TestName.generate(featureName, 'Change default value for Envelope content when played automatically and save'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();
    I.checkOption(CXE.messagingPage.playEnvelopeAfter);

    // Validating default is checked
    I.seeCheckboxIsChecked(CXE.messagingPage.dateTimeOnly);

    //Change the default value and save
    I.checkOption(CXE.messagingPage.dateTimeSender);
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeCheckboxIsChecked(CXE.messagingPage.dateTimeSender);
    I.dontSeeCheckboxIsChecked(CXE.messagingPage.dateTimeOnly);

});


/**
 * Select Playback options and save
 */

 Scenario(TestName.generate(featureName, 'Select Playback options and save'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();

    //Selecting playback options and saving the changes
    I.checkOption(CXE.messagingPage.playFirstMessage);
    I.checkOption(CXE.messagingPage.sortUrgentFirst);
    I.checkOption(CXE.messagingPage.listenByType);
    
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeCheckboxIsChecked(CXE.messagingPage.playFirstMessage);
    I.seeCheckboxIsChecked(CXE.messagingPage.sortUrgentFirst);
    I.seeCheckboxIsChecked(CXE.messagingPage.listenByType);

});

/**
 * Change default value for Message playback order and save
 */

 Scenario(TestName.generate(featureName, 'Change default value for Message playback order and save'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();

    // Validating default is checked
    I.seeCheckboxIsChecked(CXE.messagingPage.mostRecentFirst);

    //Change the default value and save
    I.checkOption(CXE.messagingPage.oldestFirst);
    
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeCheckboxIsChecked(CXE.messagingPage.oldestFirst);

});

/**
 * Change default value for Playback speed persistence and save
 */

 Scenario(TestName.generate(featureName, 'Change default value for Playback speed persistence and save'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();

    // Validating default is checked
    I.seeCheckboxIsChecked(CXE.messagingPage.playbackSpeedSessionOnly);

    //Change the default value and save
    I.checkOption(CXE.messagingPage.playbackSpeedPersistAll);
    I.seeElement(CXE.messagingPage.playbackSpeedControlEnabled);
    I.seeElement(CXE.messagingPage.resetNormalButtonEnabled);
    
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeCheckboxIsChecked(CXE.messagingPage.playbackSpeedPersistAll);
    I.seeElement(CXE.messagingPage.playbackSpeedControlEnabled);
    I.seeElement(CXE.messagingPage.resetNormalButtonEnabled);

});

/**
 * Change playback speed rate and verify the modification.
 */

 Scenario(TestName.generate(featureName, 'Change playback speed rate and verify the modification.'), async ({ I, CXE }) => {

    const mailbox = TestContext.getInstance().username;
    const mailboxPassword = TestContext.getInstance().password;

    CXE.goto.loginPage();
    CXE.loginPage.signIn(mailbox, mailboxPassword);

    CXE.goto.messagingPage();

    I.checkOption(CXE.messagingPage.playbackSpeedPersistAll);

    //Validating default value
    I.see('Playback speed (0)', CXE.messagingPage.playbackSpeedLabel);

    //Change the default value and save
    I.dragSlider(CXE.messagingPage.playbackSpeedControl, 100);
    let playbackspeedrate = await I.grabTextFrom(CXE.messagingPage.playbackSpeedLabel);
    I.click(CXE.messagingPage.saveButton);

    // Verifying field values have been updated by logging out and logging in again.
    CXE.homePage.logout();
    CXE.loginPage.signIn(mailbox, mailboxPassword);
    CXE.goto.messagingPage();

    I.seeElement(CXE.messagingPage.playbackSpeedControlEnabled);
    I.see(playbackspeedrate, CXE.messagingPage.playbackSpeedLabel);

}); 