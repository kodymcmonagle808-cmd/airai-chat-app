function doGet(e) {
  const callback = e.parameter.callback;
  const action = e.parameter.action;
  
  let result = {};
  
  if (action === 'report') {
    // Save a report
    const model = e.parameter.model;
    const time = e.parameter.time;
    const date = e.parameter.date;
    const timestamp = e.parameter.timestamp;
    
    const report = {
      model: model,
      time: time,
      date: date,
      timestamp: timestamp
    };
    
    // Get existing reports
    const props = PropertiesService.getScriptProperties();
    let reports = [];
    const stored = props.getProperty('reports');
    if (stored) {
      reports = JSON.parse(stored);
    }
    
    // Add new report
    reports.push(report);
    
    // Keep only last 100 reports to avoid storage limits
    if (reports.length > 100) {
      reports = reports.slice(-100);
    }
    
    // Save back
    props.setProperty('reports', JSON.stringify(reports));
    
    result = {
      success: true,
      message: 'Report saved',
      totalReports: reports.length
    };
    
  } else if (action === 'getreports') {
    // Get all reports
    const props = PropertiesService.getScriptProperties();
    const stored = props.getProperty('reports');
    
    if (stored) {
      result = {
        success: true,
        reports: JSON.parse(stored)
      };
    } else {
      result = {
        success: true,
        reports: []
      };
    }
  }
  
  // Return JSONP response
  const json = JSON.stringify(result);
  return ContentService.createTextOutput(callback + '(' + json + ')')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}
