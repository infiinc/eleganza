const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");

const client = new Client({
  authStrategy: new LocalAuth(),
});

let userStates = {};

client.on("qr", (qr) => {
  console.log("QR Code received, scan now!");
  qrcode.generate(qr, { small: true });
});

client.on("authenticated", () => {
  console.log("Authenticated successfully");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failed:", msg);
});

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  const chatId = message.from;

  if (message.body.toLowerCase() === "hi") {
    userStates[chatId] = "greeted";

    await message.reply(`Hello and welcome to *Eleganza!* Thank you for reaching out to us. We're here to assist you with all your bathroom assessory needs.

Please let us know how we can help you today:
*1. Complaint:* If you have any issues or complaints, we're here to resolve them promptly.
*2. Download Catelogue:* Interested in our products? Get our latest catalogue.
*3. Contact us:* Need more information? Feel free to reach out, and we'll get back to you as soon as possible.

Thank you for choosing Eleganza! Your satisfaction is our priority


👨‍💻 Developed by Inventors - 9595364574`);
  } else if (message.body === "2" && userStates[chatId] === "greeted") {
    await message.reply(
      `Here is our latest *Eleganza Catalogue*. Feel free to explore our products!`
    );
    const catalogue1 = MessageMedia.fromFilePath("./ELEGANZA_CATALOGUE_1.pdf");
    const catalogue2 = MessageMedia.fromFilePath("./ELEGANZA_CATALOGUE_2.pdf");
    await client.sendMessage(chatId, catalogue1, {
      caption: "Part 1 - Sanitaryware",
    });
    await client.sendMessage(chatId, catalogue2, {
      caption: "Part 2 - Chrome Plated Fittings",
    });
  } else if (message.body === "3" && userStates[chatId] === "greeted") {
    await message.reply(`You can contact us at:
📞 *Phone:* +91 8888881898 
📧 *Email:* eleganzabathfitting@gmail.com  
Feel free to reach out, and we will be happy to assist you! 😊`);
  } else if (message.body === "1" && userStates[chatId] === "greeted") {
    userStates[chatId] = "awaiting_details";
    await message.reply(`Thanks for reaching out! Please share following details:
Name:
Address:
Pincode:
We'll get on it right away!`);
  } else if (userStates[chatId] === "awaiting_details") {
    userStates[chatId] = "awaiting_issue_type";
    await message.reply(`Thank you! Now, please select the type of issue you are facing:
1. Leakage  
2. Breakage 
3. Flow Problem`);
  } else if (userStates[chatId] === "awaiting_issue_type") {
    if (message.body === "1" || message.body === "3") {
      userStates[chatId] = "awaiting_video";
      await message.reply(
        `Please upload a *video* showing the issue so we can assist you better.`
      );
    } else if (message.body === "2") {
      userStates[chatId] = "awaiting_breakage_video";
      await message.reply(
        `Please upload a *video* showing the broken item so we can verify the issue.`
      );
    } else {
      await message.reply(`Please select a valid option:  
*1. Leakage*  
*2. Breakage*  
*3. Flow Problem*`);
    }
  } else if (userStates[chatId] === "awaiting_video" && message.hasMedia) {
    userStates[chatId] = "solution_sent";
    await message.reply(`Thank you for sharing the video! Our team will review it and provide you with a possible solution shortly. Please follow the instructions carefully and let us know if the issue is resolved.
Reply with:  
*Yes* - If the issue is fixed  
*No* - If the problem still exists`);
    userStates[chatId] = "awaiting_feedback";
  } else if (userStates[chatId] === "awaiting_feedback") {
    if (message.body.toLowerCase() === "no") {
      userStates[chatId] = "completed";
      await message.reply(`We sincerely apologize for the inconvenience. Our representative will visit you within *48 hours* to resolve the issue.  
Thank you for your patience and for choosing *Eleganza*! 🙏

Your query has been completed. If you need further assistance, type *Hi* to start a new conversation.`);
    } else {
      userStates[chatId] = "completed";
      await message.reply(
        `Great to hear that your issue is resolved! If you need any further assistance, feel free to contact us. 😊
        
        Your query has been completed. If you need further assistance, type *Hi* to start a new conversation.`
      );
    }
  } else if (
    userStates[chatId] === "awaiting_breakage_video" &&
    message.hasMedia
  ) {
    userStates[chatId] = "breakage_verified";
    await message.reply(`Thank you for sharing the video! Your issue has been verified.  
Please visit the *dealer* from where you purchased the product to get a replacement!

Your query has been completed. If you need further assistance, type *Hi* to start a new conversation.`);
    userStates[chatId] = "completed";
  }
});

client.initialize();
