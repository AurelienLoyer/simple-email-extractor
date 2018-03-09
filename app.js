var excel = require('excel-stream')
var fs = require('fs')

var email_array = []
var file_name = 'files/formated_mails.txt'

fs.createReadStream('files/test.xls')
    .pipe(excel())  // same as excel({sheetIndex: 0}) 
    .on('data', (data) => {
        //
        var emails = extractEmails(JSON.stringify(data));
        emails.map((mail) => {
            if(!email_array.includes(mail)){
                email_array.push(mail);
            }
        })
    })
    .on('close', function(){
        console.log('done')
        fs.writeFile(file_name, email_array.join('\r\n'), function(err) {
            if(err) {
                return console.log(err)
            }
            console.log("The file was saved!")
            console.log(`We save ${email_array.length} emails !`)
        }); 
    });


function extractEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}
