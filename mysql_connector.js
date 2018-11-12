let mysql = require('mysql');

let BUG_REPORT_TABLENAME = 'BUG_REPORT';
let REPORT_REPLY_TABLENAME = 'REPORT_REPLY';

let INSERT_BUG_REPORT_QUERY = 'INSERT INTO' + BUG_REPORT_TABLENAME + " (TITLE, POSTED_ON, POSTED_BY, CONTENT) VALUES(?, ?, ?, ?)";

module.exports.connect = function(host, database, username, password){
    return mysql.createConnection({
        host: host,
        database: database,
        user: username,
        password: password
    })
};

module.exports.insertBugReport = function (report){
    mysql.query(INSERT_BUG_REPORT_QUERY,
        report.title,
        report.postedOn,
        report.postedBy,
        report.content);


};

