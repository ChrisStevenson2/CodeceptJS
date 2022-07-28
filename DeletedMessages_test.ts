import path = require('path');
import { v4 as uuidv4 } from 'uuid';

const featureName: string = path.parse(__filename).name;
const tryTo = codeceptjs.container.plugins('tryTo');

import { AudioMessageBuilder } from '../../../library/api/webclient/builders/audioMessageBuilder';
import { MessageBuilder } from '../../../library/api/webclient/builders/messageBuilder';
import { MessageData } from '../../../library/api/webclient/data/messageData';
import { Recipients } from '../../../library/api/webclient/models/recipients';
import { TestContext } from '../../../library/testcontext/testcontext';
import { TestName } from '../../../library/testname';

Feature('Web Client');

Before(({ CXE }) => {
    CXE.goto.loginPage();
});

/**
 * BVT for marking a message as saved.
 */
Scenario(TestName.generate(featureName, 'Test Messaging Deleted From Inbox'), async ({ CXE, ClientAPI }) => {
    await ClientAPI.setup();

    const mailbox = TestContext.getInstance().username;
    const displayName = TestContext.getInstance().accountName;
    const messageBuilder = new MessageBuilder(mailbox, new Array<Recipients>(new Recipients(mailbox, displayName)), displayName, mailbox).withSubject(uuidv4());

    await ClientAPI.message.createWithAudio(new AudioMessageBuilder(MessageData.shortAudioMessage(), 998.4375).build(), messageBuilder);

    // Sign in while we wait for the message to be received
    CXE.loginPage.signIn();

    // Wait for message to exist. in the Inbox
    const messageObject: unknown = await ClientAPI.inbox.getSingle(messageBuilder.subject);

    CXE.inboxPage.verifyMessageExists(messageBuilder.subject);
    CXE.inboxPage.deleteMessage(messageBuilder.subject);

    CXE.goto.deletedMessages();
    CXE.deletedMessages.verifyNoMessageSelectedMessage();
    CXE.deletedMessages.verifyMessageExists(messageBuilder.subject);
    CXE.deletedMessages.verifyMessage(messageBuilder.subject, messageBuilder.senderName, messageBuilder.senderMBID);

    await ClientAPI.inbox.remove([messageObject]);
});

/**
 * BVT for ensuring the proper message with there are no deleted items.
 */
Scenario(TestName.generate(featureName, 'Test Empty Deleted Items'), ({ CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.deletedMessages();
    CXE.deletedMessages.verifyNoMessages();
    CXE.deletedMessages.verifyNoMessageSelectedMessage();
});

/**
 * Tests if message pane is shown on screen
 */
Scenario(TestName.generate(featureName, 'Test Show/Hide of Reading Pane From Deleted Messages'), async ({ I, CXE }) => {
    CXE.loginPage.signIn(TestContext.getInstance().username, TestContext.getInstance().password);

    CXE.goto.deletedMessages();

    await CXE.deletedMessages.showReadingPane();

    const messageListSize = await I.grabElementBoundingRect(CXE.deletedMessages.leftContainer);
    const headerSize = await I.grabElementBoundingRect(CXE.deletedMessages.header);
    const footerSize = await I.grabElementBoundingRect(CXE.deletedMessages.footer);

    // Hide reading pane and check if elements have been resized
    await CXE.deletedMessages.hideReadingPane();

    let messageListSizeResize = await I.grabElementBoundingRect(CXE.deletedMessages.leftContainer);
    let headerSizeResize = await I.grabElementBoundingRect(CXE.deletedMessages.header);
    let footerSizeResize = await I.grabElementBoundingRect(CXE.deletedMessages.footer);

    I.assert(messageListSize.width < messageListSizeResize.width, true, `Expected that actual message list width${messageListSizeResize.width}is larger then original width ${messageListSize.width}`);
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
    await CXE.deletedMessages.showReadingPane();

    messageListSizeResize = await I.grabElementBoundingRect(CXE.deletedMessages.leftContainer);
    headerSizeResize = await I.grabElementBoundingRect(CXE.deletedMessages.header);
    footerSizeResize = await I.grabElementBoundingRect(CXE.deletedMessages.footer);

    I.assert(messageListSize.width, messageListSizeResize.width, `Expected that actual message list width ${messageListSizeResize.width} to equal original width ${messageListSize.width}`);
    I.assert(headerSize.width, headerSizeResize.width, `Expected that actual header width ${headerSizeResize.width} to equal original width ${headerSize.width}`);

    if (await tryTo(() => I.seeElement(CXE.deletedMessages.footer))) {
        I.assert(footerSize.width, footerSizeResize.width, `Expected that actual footer width ${footerSizeResize.width} to equal original width ${footerSize.width}`);
    }
});

Scenario(TestName.generate(featureName, 'Validate Deleted Messages Header Content - Shown Reading Pane'), async ({ I, CXE }) => {
    CXE.goto.loginPage();
    CXE.loginPage.signIn();

    CXE.goto.deletedMessages();

    // Ensure reading pane is shown
    CXE.deletedMessages.showReadingPane();

    // Validate refresh button and hover text
    I.visuallyValidateObject(CXE.deletedMessages.refreshButton, 'Deleted Messages Refresh Button', CXE.deletedMessages.pageName);
    const refreshToolTip = await I.grabAttributeFrom(CXE.deletedMessages.refreshButton, 'Title');
    I.assert(refreshToolTip, 'Refresh', 'Expected refresh tooltip to match string of Refresh');

    // Validate hide reading pane button visually and hover text
    I.visuallyValidateObject(CXE.deletedMessages.hideReadingPaneButton, 'Hide Reading Pane Button', CXE.deletedMessages.pageName);
    const hideReadingPane = await I.grabAttributeFrom(CXE.deletedMessages.hideReadingPaneButton, 'Title');
    I.assert(hideReadingPane, 'Hide Reading Pane', 'Expected refresh tooltip to match string for Hide Reading Pane button');
});

Scenario(TestName.generate(featureName, 'Validate Deleted Messages Header Content - Hidden Reading Pane'), async ({ I, CXE }) => {
    CXE.loginPage.signIn();

    CXE.goto.deletedMessages();

    // Ensure reading pane is hidden
    await CXE.deletedMessages.hideReadingPane();

    // TODO: Cannot visually validate the items below due to a puppeter bug with screenshots where it will trigger an internal refresh method that causes the reading pane to appear.
    const refreshToolTip = await I.grabAttributeFrom(CXE.deletedMessages.refreshButton, 'Title');
    I.assert(refreshToolTip, 'Refresh', 'Expected refresh tooltip to match string of Refresh');

    const showReadingPane = await I.grabAttributeFrom(CXE.deletedMessages.showReadingPaneButton, 'Title');
    I.assert(showReadingPane, 'Show Reading Pane', 'Expected refresh tooltip to match string for Show Reading Pane button');
});
