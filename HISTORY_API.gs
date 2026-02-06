function doGet(e) {
  const callback = e.parameter.callback;
  const action = e.parameter.action;
  const sheet = SpreadsheetApp.openById('1N2p1eL5BzadAvQTdAjC6SmmIKC14rJ4GggOofD8m-QQ').getSheetByName('ChatHistory');
  
  let result = {};
  
  try {
    if (action === 'register') {
      const username = e.parameter.username;
      const password = e.parameter.password;
      
      // Check if user exists
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username) {
          result = { success: false, error: 'Username already exists' };
          return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
      }
      
      // Add new user with default "user" role
      sheet.appendRow([username, password, new Date(), '[]', 'user']);
      result = { success: true, message: 'Account created' };
      
    } else if (action === 'login') {
      const username = e.parameter.username;
      const password = e.parameter.password;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username && data[i][1] === password) {
          const history = JSON.parse(data[i][3] || '[]');
          const role = data[i][4] || 'user';
          
          // Get disabled models from control sheet
          let disabled = [];
          try {
            const files = DriveApp.getFilesByName('AirAI_ModelControl');
            if (files.hasNext()) {
              const ss = SpreadsheetApp.open(files.next());
              const s = ss.getSheetByName('Settings');
              if (s) {
                const d = s.getDataRange().getValues();
                for (let j = 1; j < d.length; j++) {
                  if (d[j][0] === 'disabledModels') {
                    disabled = JSON.parse(d[j][1] || '[]');
                    break;
                  }
                }
              }
            }
          } catch (err) {
            Logger.log('Error loading disabled models: ' + err);
          }
          
          result = { 
            success: true, 
            username: username, 
            history: history, 
            role: role,
            disabled: disabled
          };
          
          return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        }
      }
      
      result = { success: false, error: 'Invalid credentials' };
      
    } else if (action === 'saveChat') {
      const username = e.parameter.username;
      const chatData = e.parameter.chatData;
      const chatTitle = e.parameter.chatTitle;
      const timestamp = new Date().getTime();
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username) {
          let history = JSON.parse(data[i][3] || '[]');
          history.push({
            id: timestamp,
            title: chatTitle,
            date: new Date().toLocaleString(),
            messages: JSON.parse(chatData)
          });
          
          // Keep only last 50 chats
          if (history.length > 50) {
            history = history.slice(-50);
          }
          
          sheet.getRange(i + 1, 4).setValue(JSON.stringify(history));
          result = { success: true, history: history };
          break;
        }
      }
      
    } else if (action === 'getHistory') {
      const username = e.parameter.username;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username) {
          const history = JSON.parse(data[i][3] || '[]');
          result = { success: true, history: history };
          break;
        }
      }
      
    } else if (action === 'deleteChat') {
      const username = e.parameter.username;
      const chatId = parseInt(e.parameter.chatId);
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username) {
          let history = JSON.parse(data[i][3] || '[]');
          history = history.filter(chat => chat.id !== chatId);
          sheet.getRange(i + 1, 4).setValue(JSON.stringify(history));
          result = { success: true, history: history };
          break;
        }
      }
      
    } else if (action === 'renameChat') {
      const username = e.parameter.username;
      const chatId = parseInt(e.parameter.chatId);
      const newTitle = e.parameter.newTitle;
      
      const data = sheet.getDataRange().getValues();
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] === username) {
          let history = JSON.parse(data[i][3] || '[]');
          
          // Find and rename the chat
          for (let j = 0; j < history.length; j++) {
            if (history[j].id === chatId) {
              history[j].title = newTitle;
              break;
            }
          }
          
          sheet.getRange(i + 1, 4).setValue(JSON.stringify(history));
          result = { success: true, history: history };
          break;
        }
      }
    }
    
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
