/* eslint-disable @typescript-eslint/prefer-for-of */

import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { AudioMessageBuilder } from '../../../library/api/webclient/builders/audioMessageBuilder';
import { MessageBuilder } from '../../../library/api/webclient/builders/messageBuilder';
import { MessageData } from '../../../library/api/webclient/data/messageData';
import { Recipients } from '../../../library/api/webclient/models/recipients';

const featureName: string = path.parse(__filename).name;

import { Generator } from '../../../library/data/generator';
import { TestContext } from '../../../library/testcontext/testcontext';
import { TestName } from '../../../library/testname';


Feature('Web Client');

/**
 * Tests login to the system
 */
Scenario(TestName.generate(featureName, 'Test Login with messages'), async ({ I, CXE, ClientAPI }) => {
    await ClientAPI.setup();
    
    const messageBuilder = new MessageBuilder(TestContext.getInstance().username, new Array<Recipients>(new Recipients(TestContext.getInstance().username, TestContext.getInstance().accountName)), 
        TestContext.getInstance().accountName, TestContext.getInstance().username).withSubject(uuidv4());
    await ClientAPI.message.createWithAudio(new AudioMessageBuilder(MessageData.shortAudioMessage(), 998.4375).build(), messageBuilder);
    
    CXE.goto.loginPage();

    // Validate the page rendering is correct
    I.visuallyValidatePage(CXE.loginPage.pageName);

    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);
    CXE.homePage.verifyPage();
    CXE.titleBar.verifyBar();
    CXE.leftNav.verifyLeftNavigation();
    CXE.inboxPage.verifyPage();
    I.visuallyValidateObject(CXE.leftNav.inboxListItem, 'Inbox List Item - Selected', CXE.leftNav.pageName);
    
    const messagesResponse = await ClientAPI.inbox.getAll();
    const messageArray : [] = messagesResponse.data.MessageListViewData.MessageArray;

    for (let i = 0; i < messageArray.length; i++) {
        await CXE.inboxPage.verifyMessageExists(messageArray[i]);
    }    
});

Scenario(TestName.generate(featureName, 'Test Login Empty Mailbox'), ({ I, CXE }) => {
    CXE.goto.loginPage();

    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);
    CXE.homePage.verifyPage();
    CXE.titleBar.verifyBar();
    CXE.leftNav.verifyLeftNavigation();
    CXE.inboxPage.verifyPage();
    I.visuallyValidateObject(CXE.leftNav.inboxListItem, 'Inbox List Item - Selected', CXE.leftNav.pageName);
    
    CXE.inboxPage.verifyNoMessages();
});

/**
 * Tests login failure using a 1 wise pairs model.
 */
Data(
    Generator.nWise(
        {
            password: ['', '1682', '0', '983249084320948239048', 'lSiebens', 'a1b2c3d4', '!@#*$(%)^&*)_{}_+|:"?><,./l;[]\\=-'],
            username: ['1682', '0', '983249084320948239048', 'lSiebens', 'a1b2c3d4', '!@#*$(%)^&*)_{}_+|:"?><,./l;[]\\=-']
        },
        1
    )
).Scenario(TestName.generate(featureName, 'Test Login Failure'), ({ I, CXE, current }) => {
    CXE.goto.loginPage();
    CXE.loginPage.enterCredentials(current.username, current.password);
    I.click(CXE.loginPage.loginButton);

    I.see(CXE.loginPage.errorMessage);
    I.visuallyValidateObject(CXE.loginPage.errorBlock, 'Error Block', CXE.loginPage.pageName);
});

/**
 * Test error message displayed on blur
 */
Scenario(TestName.generate(featureName, 'Test Username Error Message On Blur - Tab'), ({ I, CXE }) => {
    CXE.goto.loginPage();

    // Select the text field
    I.click(CXE.loginPage.usernameTextfield);

    // Change focus out of username textbox
    I.pressKey('Tab');

    I.see(CXE.loginPage.usernameEmptyErrorMessage);
});

/**
 * Test error message displayed on blur
 */
Scenario(TestName.generate(featureName, 'Test Username Error Message On Blur - Click'), ({ I, CXE }) => {
    CXE.goto.loginPage();

    // Select the text field
    I.click(CXE.loginPage.usernameTextfield);

    // Change focus out of username textbox
    I.click(CXE.loginPage.passwordTextfield);

    I.see(CXE.loginPage.usernameEmptyErrorMessage);
});

/**
 * Test Login button disabled on blank field
 */
Scenario(TestName.generate(featureName, 'Test Login Button Disabled'), ({ I, CXE }) => {
    CXE.goto.loginPage();

    // Ensure button is disabled
    I.seeElement(CXE.loginPage.loginButtonDisabled);

    // Set text
    I.fillField(CXE.loginPage.usernameTextfield, 'T');

    // Check button not disabled
    I.dontSeeElement(CXE.loginPage.loginButtonDisabled);

    // Check if disabled on clear. Using backspace as clear field would not trigger button being disabled.
    I.pressKey('Backspace');

    I.seeElement(CXE.loginPage.loginButtonDisabled);
});

/**
 * Tests login to the system
 */
Scenario(TestName.generate(featureName, 'Test Logout'), ({ I, CXE }) => {
    CXE.goto.loginPage();

    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);
    CXE.homePage.logout();

    // Validate success message for logout
    I.visuallyValidateObject(CXE.loginPage.successLogoutMessageBlock, 'Logout Success Message', CXE.loginPage.pageName);
});
