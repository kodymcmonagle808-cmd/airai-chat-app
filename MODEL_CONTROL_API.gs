// MODEL CONTROL API - Google Apps Script
const SPREADSHEET_ID = '1_OEemEGgGKabg1JfR9Jk96d6_8Qo8du-Y5znRYkC2qA';
const MODEL_CONTROL_SHEET = 'ModelControl';

function doGet(e) {
  const params = e.parameter;
  const callback = params.callback;
  const action = params.action;
  
  let response = {};
  
  try {
    switch(action) {
      case 'getModelStatus':
        response = getModelStatus();
        break;
      case 'updateModelStatus':
        response = updateModelStatus(params.username, params.model, params.enabled === 'true', params.staffLocked === 'true');
        break;
      case 'updateStaffLock':
        response = updateStaffLock(params.username, params.enabled === 'true');
        break;
      default:
        response = { success: false, error: 'Invalid action' };
    }
  } catch (error) {
    response = { success: false, error: error.toString() };
  }
  
  const output = callback + '(' + JSON.stringify(response) + ')';
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getModelStatus() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(MODEL_CONTROL_SHEET);
    
    if (!sheet) {
      sheet = ss.insertSheet(MODEL_CONTROL_SHEET);
      sheet.appendRow(['Model', 'Enabled', 'StaffLocked', 'LastModified', 'ModifiedBy']);
      
      // *** COMPLETE MODEL LIST - Including ALL models from frontend ***
      const defaultModels = [
        // Main models
        'gemini', 'groq', 'cerebra', 'openai', 'deepseek', 'qwen', 'mistral',
        'nous', 'tongyi', 'trinity', 'glm', 'nova', 'airai',
        
        // CB Models (Cerebras)
        'llama3.1-8b', 
        'llama-3.3-70b', 
        'gpt-oss-120b', 
        'qwen-3-32b',
        'qwen-3-235b-a22b-instruct-2507', 
        'zai-glm-4.6', 
        'zai-glm-4.7',
        
        // OpenRouter Models
        'xiaomi/mimo-v2-flash:free',
        'nvidia/nemotron-3-nano-30b-a3b:free',
        'mistralai/devstral-2512:free',
        'nex-agi/deepseek-v3.1-nex-n1:free',
        'arcee-ai/trinity-mini:free',
        'tngtech/tng-r1t-chimera:free',
        'kwaipilot/kat-coder-pro:free',
        'nvidia/nemotron-nano-12b-v2-vl:free',
        'nvidia/nemotron-nano-9b-v2:free',
        'openai/gpt-oss-120b:free',
        'openai/gpt-oss-20b:free',
        'z-ai/glm-4.5-air:free',
        'qwen/qwen3-coder:free',
        'moonshotai/kimi-k2:free',
        'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
        'google/gemma-3n-e2b-it:free',
        'tngtech/deepseek-r1t2-chimera:free',
        'deepseek/deepseek-r1-0528:free',
        'google/gemma-3n-e4b-it:free',
        'qwen/qwen3-4b:free',
        'tngtech/deepseek-r1t-chimera:free',
        'mistralai/mistral-small-3.1-24b-instruct:free',
        'google/gemma-3-4b-it:free',
        'google/gemma-3-12b-it:free',
        'google/gemma-3-27b-it:free',
        'google/gemini-2.0-flash-exp:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'meta-llama/llama-3.2-3b-instruct:free',
        'qwen/qwen-2.5-vl-7b-instruct:free',
        'nousresearch/hermes-3-llama-3.1-405b:free',
        'meta-llama/llama-3.1-405b-instruct:free',
        'mistralai/mistral-7b-instruct:free'
      ];
      
      defaultModels.forEach(model => {
        sheet.appendRow([model, 'true', 'false', new Date().toISOString(), 'System']);
      });
    }
    
    const data = sheet.getDataRange().getValues();
    const models = {};
    
    for (let i = 1; i < data.length; i++) {
      models[data[i][0]] = {
        enabled: data[i][1] === 'true' || data[i][1] === true,
        staffLocked: data[i][2] === 'true' || data[i][2] === true,
        lastModified: data[i][3],
        modifiedBy: data[i][4]
      };
    }
    
    // Get staff lock status
    let staffLockEnabled = false;
    let staffLockSheet = ss.getSheetByName('StaffLock');
    
    if (!staffLockSheet) {
      staffLockSheet = ss.insertSheet('StaffLock');
      staffLockSheet.appendRow(['Setting', 'Value', 'LastModified', 'ModifiedBy']);
      staffLockSheet.appendRow(['StaffLockEnabled', 'false', new Date().toISOString(), 'System']);
    }
    
    const staffLockData = staffLockSheet.getDataRange().getValues();
    if (staffLockData.length > 1) {
      staffLockEnabled = staffLockData[1][1] === 'true' || staffLockData[1][1] === true;
    }
    
    return { 
      success: true, 
      models: models,
      staffLockEnabled: staffLockEnabled
    };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateModelStatus(username, model, enabled, staffLocked) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(MODEL_CONTROL_SHEET);
    
    if (!sheet) {
      return { success: false, error: 'Sheet not found' };
    }
    
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === model) {
        rowIndex = i + 1;
        break;
      }
    }
    
    if (rowIndex === -1) {
      sheet.appendRow([model, enabled.toString(), staffLocked.toString(), new Date().toISOString(), username]);
    } else {
      sheet.getRange(rowIndex, 2).setValue(enabled.toString());
      sheet.getRange(rowIndex, 3).setValue(staffLocked.toString());
      sheet.getRange(rowIndex, 4).setValue(new Date().toISOString());
      sheet.getRange(rowIndex, 5).setValue(username);
    }
    
    return getModelStatus();
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

function updateStaffLock(username, enabled) {
  try {
    if (username !== 'KodyCookie') {
      return { success: false, error: 'Only KodyCookie can modify staff lock' };
    }
    
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName('StaffLock');
    
    if (!sheet) {
      sheet = ss.insertSheet('StaffLock');
      sheet.appendRow(['Setting', 'Value', 'LastModified', 'ModifiedBy']);
      sheet.appendRow(['StaffLockEnabled', 'false', new Date().toISOString(), 'System']);
    }
    
    sheet.getRange(2, 2).setValue(enabled.toString());
    sheet.getRange(2, 3).setValue(new Date().toISOString());
    sheet.getRange(2, 4).setValue(username);
    
    return { success: true, staffLockEnabled: enabled };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
