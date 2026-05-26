/**
 * Google Apps Script for TechVedyaa Lead Form (Secure Version)
 * 
 * This script handles incoming GET & POST requests from the lead contact form,
 * populates the spreadsheet with the lead details, and sends a real-time 
 * notification via Telegram instead of email.
 * 
 * SECURITY: This version retrieves credentials securely from Google Apps Script 
 * environment variables (Script Properties), so no raw secrets are in the code.
 */

// Retrieve credentials securely from Google Apps Script environment settings
var TELEGRAM_BOT_TOKEN = PropertiesService.getScriptProperties().getProperty("TELEGRAM_BOT_TOKEN");
var TELEGRAM_CHAT_ID = PropertiesService.getScriptProperties().getProperty("TELEGRAM_CHAT_ID");

/**
 * Handles GET requests from the Next.js frontend (ContactSection.tsx uses fetch with GET)
 */
function doGet(e) {
  return handleLeadFormSubmit(e);
}

/**
 * Handles POST requests (for future-proofing or alternative submission methods)
 */
function doPost(e) {
  return handleLeadFormSubmit(e);
}

/**
 * Main request handler to process form inputs, append to Google Sheets, and notify Telegram
 */
function handleLeadFormSubmit(e) {
  try {
    if (!e || !e.parameter) {
      throw new Error("No parameters received in the request.");
    }
    
    var sheet = SpreadsheetApp.getActiveSheet();
    
    // Initialize headers if spreadsheet is completely empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "WhatsApp Enabled", "Requirements"]);
    }
    
    // Capture form values from the URL query parameters
    var timestamp = new Date();
    var name = e.parameter.name || "N/A";
    var email = e.parameter.email || "N/A";
    var phone = e.parameter.phone || "N/A";
    var whatsappEnabled = e.parameter.whatsappEnabled === "true" || e.parameter.whatsappEnabled === true ? "Yes" : "No";
    var requirements = e.parameter.requirements || "N/A";
    
    // Append a new row to the sheet
    sheet.appendRow([timestamp, name, email, phone, whatsappEnabled, requirements]);
    
    // Send Telegram Notification (instead of traditional Email notification)
    sendTelegramNotification();
    
    // Return a JSON response back to the Next.js frontend
    var result = { status: "success", message: "Lead recorded and notification sent." };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    var errorResult = { status: "error", message: error.toString() };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Sends a rich, dynamically formatted Telegram notification with the latest lead details
 */
function sendTelegramNotification() {
  var botToken = TELEGRAM_BOT_TOKEN;
  var chatId = TELEGRAM_CHAT_ID;
  
  // Guard clause in case they haven't configured the credentials yet in Script Properties
  if (!botToken || !chatId) {
    Logger.log("Telegram credentials not configured in Script Properties. Skipping notification.");
    return;
  }
  
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    Logger.log("No data rows found to notify.");
    return;
  }
  
  // Fetch the headers (Row 1) and the new lead data (Last Row)
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var leadData = sheet.getRange(lastRow, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Construct the notification message using Telegram Markdown
  var message = "🚀 *New Lead Received!* \n\n";
  for (var i = 0; i < headers.length; i++) {
    // Format timestamp nicely if it is a Date object
    var value = leadData[i];
    if (value instanceof Date) {
      value = Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    }
    message += "🔹 *" + headers[i] + ":* " + value + "\n";
  }
  
  // Call the Telegram sendMessage API
  var url = "https://api.telegram.org/bot" + botToken + "/sendMessage";
  var payload = {
    "chat_id": chatId,
    "text": message,
    "parse_mode": "Markdown"
  };
  
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  Logger.log("Telegram API Response: " + response.getContentText());
}
