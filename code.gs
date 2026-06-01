/**
 * =========================================================================
 *             TECHVEDYAA LEAD FORM GOOGLE APPS SCRIPT (v2.0)
 * =========================================================================
 * 
 * INSTRUCTIONS FOR SETTING UP TELEGRAM NOTIFICATIONS:
 * 
 * 1. BOT TOKEN: Paste your Telegram Bot Token in the CONFIG.botToken field below.
 *    Example: "1234567890:ABCdefGhIJKlmNoPqRStUvWxYz"
 * 
 * 2. CHAT ID: Paste your personal Telegram Chat ID (a number) in the CONFIG.chatId field.
 *    Example: "987654321" (Use @userinfobot in Telegram to get this number)
 * 
 * 3. SAVE AND RUN TEST:
 *    - Press Cmd+S (Mac) or Ctrl+S (Windows) to Save in the Google Apps Script editor.
 *    - Select the function "testTelegramConnection" from the dropdown in the toolbar.
 *    - Click the "Run" button to verify.
 * 
 * 4. DEPLOY:
 *    - Click "Deploy" -> "Manage deployments" -> Click the Edit (pencil) icon -> Select "New version" -> Click "Deploy".
 */

var CONFIG = {
  // --- PASTE YOUR CREDENTIALS HERE ---
  botToken: "YOUR_TELEGRAM_BOT_TOKEN_HERE",
  chatId: "YOUR_TELEGRAM_CHAT_ID_HERE",
  
  // If set to true, it will read from Project Settings -> Script Properties instead.
  // Set to false to force it to use the tokens pasted above.
  useScriptProperties: false
};

// Resolve credentials based on config choice
var TELEGRAM_BOT_TOKEN = CONFIG.useScriptProperties 
  ? (PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN") || CONFIG.botToken)
  : CONFIG.botToken;

var TELEGRAM_CHAT_ID = CONFIG.useScriptProperties 
  ? (PropertiesService.getScriptProperties().getProperty("TELEGRAM_CHAT_ID") || CONFIG.chatId)
  : CONFIG.chatId;


/**
 * Web App entry point for GET requests
 */
function doGet(e) {
  return handleLeadFormSubmit(e);
}

/**
 * Web App entry point for POST requests
 */
function doPost(e) {
  return handleLeadFormSubmit(e);
}

/**
 * Processes incoming form submissions, writes to Sheet, and alerts Telegram
 */
function handleLeadFormSubmit(e) {
  try {
    if (!e || !e.parameter) {
      throw new Error("No parameters received in the request.");
    }
    
    var sheet = SpreadsheetApp.getActiveSheet();
    
    // Initialize sheet headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "WhatsApp Enabled", "Requirements"]);
    }
    
    // Parse form parameters
    var timestamp = new Date();
    var name = e.parameter.name || "N/A";
    var email = e.parameter.email || "N/A";
    var phone = e.parameter.phone || "N/A";
    var whatsappEnabled = (e.parameter.whatsappEnabled === "true" || e.parameter.whatsappEnabled === true) ? "Yes" : "No";
    var requirements = e.parameter.requirements || "N/A";
    
    // Append to Google sheet
    sheet.appendRow([timestamp, name, email, phone, whatsappEnabled, requirements]);
    
    // Trigger Telegram notification
    sendTelegramAlert(name, email, phone, whatsappEnabled, requirements, timestamp);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Lead saved and Telegram alert sent!" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log("Error in submission handler: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sends a safely formatted HTML notification to Telegram
 */
function sendTelegramAlert(name, email, phone, whatsappEnabled, requirements, timestamp) {
  var botToken = TELEGRAM_BOT_TOKEN;
  var chatId = TELEGRAM_CHAT_ID;
  
  if (!botToken || botToken.indexOf("YOUR_TELEGRAM_BOT_TOKEN") === 0 || botToken.trim() === "") {
    throw new Error("Telegram Bot Token is not configured! Please configure it at the top of the script.");
  }
  if (!chatId || chatId.indexOf("YOUR_TELEGRAM_CHAT_ID") === 0 || chatId.toString().trim() === "") {
    throw new Error("Telegram Chat ID is not configured! Please configure it at the top of the script.");
  }
  
  // Format the date/time nicely
  var formattedTime = Utilities.formatDate(timestamp || new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  
  // HTML-escape values to ensure the Telegram API parser never crashes on special characters
  var safeName = htmlEscape(name);
  var safeEmail = htmlEscape(email);
  var safePhone = htmlEscape(phone);
  var safeWhatsapp = htmlEscape(whatsappEnabled);
  var safeRequirements = htmlEscape(requirements);
  
  // Construct the HTML formatted message
  var message = "🚀 <b>New Lead Received!</b>\n\n" +
                "🔹 <b>Name:</b> " + safeName + "\n" +
                "🔹 <b>Email:</b> " + safeEmail + "\n" +
                "🔹 <b>Phone:</b> " + safePhone + "\n" +
                "🔹 <b>WhatsApp:</b> " + safeWhatsapp + "\n" +
                "🔹 <b>Time:</b> " + formattedTime + "\n\n" +
                "📝 <b>Requirements:</b>\n" + safeRequirements;
  
  var url = "https://api.telegram.org/bot" + botToken.trim() + "/sendMessage";
  var payload = {
    "chat_id": chatId.toString().trim(),
    "text": message,
    "parse_mode": "HTML"
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var responseCode = response.getResponseCode();
  var responseText = response.getContentText();
  
  Logger.log("Telegram API Response Code: " + responseCode + ", Content: " + responseText);
  
  if (responseCode !== 200) {
    throw new Error("Telegram notification failed: " + responseText);
  }
}

/**
 * Diagnostic test to run directly in Apps Script editor
 */
function testTelegramConnection() {
  Logger.log("=== STARTING TELEGRAM BOT DIAGNOSTIC ===");
  try {
    var botToken = TELEGRAM_BOT_TOKEN;
    var chatId = TELEGRAM_CHAT_ID;
    
    Logger.log("1. Checking config variables...");
    Logger.log("   - Bot Token: " + (botToken ? botToken.substring(0, Math.min(10, botToken.length)) + "..." : "EMPTY"));
    Logger.log("   - Chat ID: " + chatId);
    
    if (!botToken || botToken.indexOf("YOUR_") === 0) {
      throw new Error("Please configure your actual Bot Token in the CONFIG object at the top of the file.");
    }
    if (!chatId || chatId.indexOf("YOUR_") === 0) {
      throw new Error("Please configure your actual Chat ID in the CONFIG object at the top of the file.");
    }
    
    if (botToken.indexOf(":") === -1) {
      Logger.log("⚠️ WARNING: Your Bot Token does not contain a colon (:). It might be incomplete or swapped!");
    } else {
      var extractedBotId = botToken.split(":")[0];
      Logger.log("   - Extracted Bot ID from Token: " + extractedBotId);
      if (String(extractedBotId).trim() === String(chatId).trim()) {
        Logger.log("❌ ERROR: Your Chat ID is identical to your Bot ID! This is why you get the 'Forbidden' error. You must use your personal Telegram User ID, NOT the bot's ID.");
        throw new Error("Chat ID matches Bot ID. Check instruction step 2.");
      }
    }
    
    Logger.log("2. Attempting to send secure HTML test message...");
    sendTelegramAlert(
      "Test User",
      "test@example.com",
      "+1 234 567 8900",
      "Yes",
      "This is a manual connection test from the Apps Script editor! 🚀",
      new Date()
    );
    
    Logger.log("✅ SUCCESS: Telegram bot sent the message successfully! Check your Telegram app.");
  } catch (error) {
    Logger.log("❌ FAILED: " + error.toString());
  }
  Logger.log("=== DIAGNOSTIC COMPLETE ===");
}

/**
 * Helper to escape HTML tags to protect Telegram API HTML parser
 */
function htmlEscape(str) {
  if (!str) return "N/A";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
