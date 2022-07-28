import path = require('path');
import { v4 as uuidv4 } from 'uuid';
import { AudioMessageBuilder } from '../../../library/api/webclient/builders/audioMessageBuilder';
import { MessageBuilder } from '../../../library/api/webclient/builders/messageBuilder';
import { MessageData } from '../../../library/api/webclient/data/messageData';
import { Recipients } from '../../../library/api/webclient/models/recipients';
import { TestContext } from '../../../library/testcontext/testcontext';

const featureName: string = path.parse(__filename).name;

import { TestName } from '../../../library/testname';

const tryTo = codeceptjs.container.plugins('tryTo');

Feature('Web Client');

Before(({ CXE }) => {
    CXE.goto.loginPage();
});

Scenario(TestName.generate(featureName, 'Verify No Message Selected State - No Messages For Account'), ({ CXE }) => {
    CXE.loginPage.signIn();
    CXE.goto.inbox();

    CXE.inboxPage.verifyNoMessages();
    CXE.inboxPage.verifyNoMessageSelectedMessage();
});

/**
 * Verify no message selected text when account has messages in the inbox
 */
Scenario(TestName.generate(featureName, 'Test Messaging Saved From Inbox'), async ({ CXE, ClientAPI }) => {
    await ClientAPI.setup();

    const mailbox = TestContext.getInstance().username;
    const displayName = TestContext.getInstance().accountName;
    const messageBuilder = new MessageBuilder(mailbox, new Array<Recipients>(new Recipients(mailbox, displayName)), displayName, mailbox).withSubject(uuidv4());

    await ClientAPI.message.createWithAudio(new AudioMessageBuilder(MessageData.shortAudioMessage(), 998.4375).build(), messageBuilder);

    // Sign in while we wait for the message to be received
    CXE.loginPage.signIn();
    CXE.inboxPage.verifyNoMessageSelectedMessagesStored();


    // Wait for message to exist. in the Inbox
    const messageObject = await ClientAPI.inbox.getSingle(messageBuilder.subject);

    await ClientAPI.inbox.remove([messageObject]);
});

/**
 * Tests if message pane is shown on screen
 */
Scenario(TestName.generate(featureName, 'Test Show/Hide of Reading Pane From Inbox'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();

    await CXE.inboxPage.showReadingPane();

    const messageListSize = await I.grabElementBoundingRect(CXE.inboxPage.leftContainer);
    const headerSize = await I.grabElementBoundingRect(CXE.inboxPage.header);
    const footerSize = await I.grabElementBoundingRect(CXE.inboxPage.footer);

    // Hide reading pane and check if elements have been resized
    await CXE.inboxPage.hideReadingPane();

    let messageListSizeResize = await I.grabElementBoundingRect(CXE.inboxPage.leftContainer);
    let headerSizeResize = await I.grabElementBoundingRect(CXE.inboxPage.header);
    let footerSizeResize = await I.grabElementBoundingRect(CXE.inboxPage.footer);

    I.assert(
        messageListSize.width < messageListSizeResize.width,
        true,
        `Expected that actual message list width ${messageListSizeResize.width} is larger then original width ${messageListSize.width}`
    );
    I.assert(headerSize.width < headerSizeResize.width, true, `Expected that actual header width ${headerSizeResize.width} is larger then original width ${headerSize.width}`);
    I.assert(
        messageListSizeResize.width === headerSizeResize.width,
        true,
        `Expected that message list width (${messageListSizeResize.width}) and  header width (${headerSizeResize.width}) are equal.`
    );

    if (await tryTo(() => I.seeElement(CXE.deletedMessages.footer))) {
        I.assert(footerSize.width < footerSizeResize.width, true, `Expected that actual footer width ${footerSizeResize.width} is larger then original width ${footerSize.width}`);
        I.assert(
            messageListSizeResize.width === footerSizeResize.width,
            true,
            `Expected that message list width (${messageListSizeResize.width}) and footer width (${footerSizeResize.width}) are all equal.`
        );
    }

    // Show reading pane again, check if back to original size
    await CXE.inboxPage.showReadingPane();

    messageListSizeResize = await I.grabElementBoundingRect(CXE.inboxPage.leftContainer);
    headerSizeResize = await I.grabElementBoundingRect(CXE.inboxPage.header);
    footerSizeResize = await I.grabElementBoundingRect(CXE.inboxPage.footer);

    I.assert(messageListSize.width, messageListSizeResize.width, `Expected that actual message list width ${messageListSizeResize.width} to equal original width ${messageListSize.width}`);
    I.assert(headerSize.width, headerSizeResize.width, `Expected that actual header width ${headerSizeResize.width} to equal original width ${headerSize.width}`);

    if (await tryTo(() => I.seeElement(CXE.deletedMessages.footer))) {
        I.assert(footerSize.width, footerSizeResize.width, `Expected that actual footer width ${footerSizeResize.width} to equal original width ${footerSize.width}`);
    }
});

Scenario(TestName.generate(featureName, 'Validate Inbox Header Content - Shown Reading Pane'), async ({ I, CXE }) => {
    CXE.goto.loginPage();
    CXE.loginPage.signIn();

    // Ensure reading pane is shown
    await CXE.inboxPage.showReadingPane();

    // Validate refresh button and hover text
    I.visuallyValidateObject(CXE.inboxPage.refreshButton, 'Inbox Refresh Button', CXE.inboxPage.pageName);
    const refreshToolTip = await I.grabAttributeFrom(CXE.inboxPage.refreshButton, 'Title');
    I.assert(refreshToolTip, 'Refresh', 'Expected refresh tooltip to match string of Refresh');

    // Validate hide reading pane button visually and hover text
    I.visuallyValidateObject(CXE.inboxPage.hideReadingPaneButton, 'Hide Reading Pane Button', CXE.inboxPage.pageName);
    const hideReadingPane = await I.grabAttributeFrom(CXE.inboxPage.hideReadingPaneButton, 'Title');
    I.assert(hideReadingPane, 'Hide Reading Pane', 'Expected refresh tooltip to match string for Hide Reading Pane button');
});

Scenario(TestName.generate(featureName, 'Validate Inbox Header Content - Hidden Reading Pane'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    // Ensure reading pane is hidden
    await CXE.inboxPage.hideReadingPane();

    // TODO: Cannot visually validate the items below due to a puppeter bug with screenshots where it will trigger an internal refresh method that causes the reading pane to appear.
    const refreshToolTip = await I.grabAttributeFrom(CXE.inboxPage.refreshButton, 'Title');
    I.assert(refreshToolTip, 'Refresh', 'Expected refresh tooltip to match string of Refresh');

    const showReadingPane = await I.grabAttributeFrom(CXE.inboxPage.showReadingPaneButton, 'Title');
    I.assert(showReadingPane, 'Show Reading Pane', 'Expected refresh tooltip to match string for Show Reading Pane button');
});

Scenario(TestName.generate(featureName, 'Validate Message count appears under the last message'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();

    CXE.inboxPage.verifyNoMessages();
    
    // Send a message and verify it exists
    const mailboxNumber = TestContext.getInstance().username;
    const messageLength = 5;
    CXE.goto.newMessage();

    const messageSubject = new Date().toISOString();
    CXE.newMessagePage.sendMessageRecordAudio(mailboxNumber, messageSubject, messageLength);
    await CXE.inboxPage.verifyMessageExists(messageSubject);

    // Verify message count "1 - 1 of 1"
    I.seeElement(CXE.inboxPage.messageCount);
    I.seeTextEquals('1 - 1 of 1', CXE.inboxPage.messageCount);
    
    // Cleanup
    CXE.inboxPage.deleteMessage(messageSubject);

});

Scenario(TestName.generate(featureName, 'Selecting a message shows message related icons'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();

    CXE.inboxPage.verifyNoMessages();
    
    // Send a message and verify it exists
    const mailboxNumber = TestContext.getInstance().username;
    const messageLength = 5;
    CXE.goto.newMessage();

    const messageSubject = new Date().toISOString();
    CXE.newMessagePage.sendMessageRecordAudio(mailboxNumber, messageSubject, messageLength);
    await CXE.inboxPage.verifyMessageExists(messageSubject);

    // Select message
    CXE.inboxPage.selectMessageBySubject(messageSubject);
    
    // Validate message related icons
    I.seeElement(CXE.inboxPage.deleteButton);
    I.seeElement(CXE.inboxPage.markAsReadButton);
    I.seeElement(CXE.inboxPage.saveButton);
    I.seeElement(CXE.inboxPage.forwardButton);
    I.seeElement(CXE.inboxPage.liveReplyButton);
    I.seeElement(CXE.inboxPage.replyToSenderButton);

    //Read a message
    I.click(CXE.inboxPage.markAsReadButton);

    // Verify Mark as Unread appears
    I.seeElement(CXE.inboxPage.markAsUnreadButton);
    
    // Cleanup
    CXE.inboxPage.deleteMessage(messageSubject);

});

Scenario(TestName.generate(featureName, 'Verify hover text for message related icons'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();

    CXE.inboxPage.verifyNoMessages();
    
    // Send a message and verify it exists
    const mailboxNumber = TestContext.getInstance().username;
    const messageLength = 5;
    CXE.goto.newMessage();

    const messageSubject = new Date().toISOString();
    CXE.newMessagePage.sendMessageRecordAudio(mailboxNumber, messageSubject, messageLength);
    await CXE.inboxPage.verifyMessageExists(messageSubject);

    // Select message
    CXE.inboxPage.selectMessageBySubject(messageSubject);

    // Verify the hover text for message related icons
    I.visuallyValidateObject(CXE.inboxPage.deleteButton, 'Move Message to Deleted Folder', CXE.inboxPage.pageName);
    const deleteToolTip = await I.grabAttributeFrom(CXE.inboxPage.deleteButton, 'Title');
    I.assert(deleteToolTip, 'Move Message to Deleted Folder', 'Expected delete tooltip to match string of Delete');

    I.visuallyValidateObject(CXE.inboxPage.markAsReadButton, 'Mark as Read', CXE.inboxPage.pageName);
    const markAsReadToolTip = await I.grabAttributeFrom(CXE.inboxPage.markAsReadButton, 'Title');
    I.assert(markAsReadToolTip, 'Mark as Read', 'Expected mark as read tooltip to match string of Mark as Read');

    I.visuallyValidateObject(CXE.inboxPage.saveButton, 'Move Message to Saved Folder', CXE.inboxPage.pageName);
    const saveToolTip = await I.grabAttributeFrom(CXE.inboxPage.saveButton, 'Title');
    I.assert(saveToolTip, 'Move Message to Saved Folder', 'Expected save tooltip to match string of Move Message to Saved Folder');

    I.visuallyValidateObject(CXE.inboxPage.forwardButton, 'Forward', CXE.inboxPage.pageName);
    const forwardToolTip = await I.grabAttributeFrom(CXE.inboxPage.forwardButton, 'Title');
    I.assert(forwardToolTip, 'Forward', 'Expected save tooltip to match string of Forward');

    I.visuallyValidateObject(CXE.inboxPage.liveReplyButton, 'Live Reply', CXE.inboxPage.pageName);
    const liveReplyToolTip = await I.grabAttributeFrom(CXE.inboxPage.liveReplyButton, 'Title');
    I.assert(liveReplyToolTip, 'Live Reply', 'Expected save tooltip to match string of Live Reply');
    
    I.visuallyValidateObject(CXE.inboxPage.replyToSenderButton, 'Reply to Sender', CXE.inboxPage.pageName);
    const replyToSenderToolTip = await I.grabAttributeFrom(CXE.inboxPage.replyToSenderButton, 'Title');
    I.assert(replyToSenderToolTip, 'Reply to Sender', 'Expected save tooltip to match string of Reply to Sender');

    //Mark message as read
    I.click(CXE.inboxPage.markAsReadButton);

    // Verify Mark as Unread appears
    I.visuallyValidateObject(CXE.inboxPage.markAsUnreadButton, 'Mark as Unread', CXE.inboxPage.pageName);
    const markAsUnreadToolTip = await I.grabAttributeFrom(CXE.inboxPage.markAsUnreadButton, 'Title');
    I.assert(markAsUnreadToolTip, 'Mark as Unread', 'Expected save tooltip to match string of Mark as Unread');

    // Cleanup
    CXE.inboxPage.deleteMessage(messageSubject);
});

Scenario(TestName.generate(featureName, 'Verify message related icons are not visible if no message is selected'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();
    
    // Verify below elements don't appear when no message is selected.
    I.dontSeeElement(CXE.inboxPage.deleteButton);
    I.dontSeeElement(CXE.inboxPage.markAsReadButton);
    I.dontSeeElement(CXE.inboxPage.saveButton);
    I.dontSeeElement(CXE.inboxPage.forwardButton);
    I.dontSeeElement(CXE.inboxPage.liveReplyButton);
    I.dontSeeElement(CXE.inboxPage.replyToSenderButton);

});

Scenario(TestName.generate(featureName, 'Verify messages per page text'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();
    
    for (let i = 1; i <= 20; i++) {
        // Send messages
        const mailboxNumber = TestContext.getInstance().username;
        const messageLength = 5;
        CXE.goto.newMessage();

        const messageSubject = new Date().toISOString();
        CXE.newMessagePage.sendMessageRecordAudio(mailboxNumber, messageSubject, messageLength);
        await CXE.inboxPage.verifyMessageExists(messageSubject);
    }
    
    // Verify messages per page text " 1 - 15 of 20 "
    I.scrollTo(CXE.inboxPage.messageCount);
    I.seeElement(CXE.inboxPage.messageCount);    
    I.seeTextEquals('1 - 15 of 20', CXE.inboxPage.messageCount);

    // Change the dropdown and verify the navigation text has changed.
    I.click(CXE.inboxPage.rowsPerPageDropdownButton);
    I.click('//webjs-simple-menu-item[2]');
    I.seeTextEquals('1 - 20 of 20', CXE.inboxPage.messageCount);

});

Scenario(TestName.generate(featureName, 'Verify the navigation options are not present if there aren’t any messages'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.inbox();

    // Verify the navigation option is not present if there aren’t any messages.
    I.dontSeeElement(CXE.inboxPage.rowsPerPageDropdownButton);
});