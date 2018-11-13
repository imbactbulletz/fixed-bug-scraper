let mysql = require('mysql');

let BUG_REPORT_TABLENAME = 'BUG_REPORT';
let REPORT_REPLY_TABLENAME = 'REPORT_REPLY';

let INSERT_BUG_REPORT_QUERY = 'INSERT INTO ' + BUG_REPORT_TABLENAME + " (TITLE, POSTED_ON, POSTED_BY, CONTENT) VALUES (?, ?, ?, ?)";
let INSERT_REPORT_REPLY_QUERY = 'INSERT INTO ' + REPORT_REPLY_TABLENAME + " (POSTED_ON, POSTED_BY, CONTENT, REPORT_ID) VALUES (?, ?, ?, ?)";
let mySQLConnection;

module.exports.connect = function(host, database, username, password){
    mySQLConnection = mysql.createConnection({
        host: host,
        database: database,
        user: username,
        password: password
    })
};

module.exports.insertBugReport = async function (threadData){
    const report = threadData.topic;

    const topicID = new Promise((resolve,reject) =>{
        mySQLConnection.query(INSERT_BUG_REPORT_QUERY,[
                threadData.topic.title,
                threadData.topic.postedOn,
                threadData.topic.postedBy,
                threadData.topic.content],
            function(err, result) {
                if (err) throw reject(err);
                resolve(result.insertId);
            });

    });

    const replies = await threadData.replies;

    for(let i=0; i < replies.length; i++){
        mySQLConnection.query(INSERT_REPORT_REPLY_QUERY, [
            replies[i].postedOn,
            replies[i].postedBy,
            replies[i].content,
            await topicID
        ], function(err) {
            if (err) throw err;
        });

    }
};

