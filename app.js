const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev'

const excel = require('excel-stream')
const fs = require('fs')
const express = require('express')
const app = express();
const bodyParser = require('body-parser')
const busboy = require('connect-busboy')
const cors = require('cors')
const server = require('http').createServer(app)
const path = require('path')

const port = process.env.PORT || 1337
var email_array = []
var file_name = 'files/formated_mails.txt'

server.listen(port)
console.log(`Server Run / Mode ${env} / Port ${port} 🎄`)

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());
app.use(busboy({
    immediate: true,
    highWaterMark: 2 * 1024 * 1024,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}));

app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    next()
});

app.get('/', function (req, res, next) {
    res.sendfile(`${__dirname}/front/index.html`)
    app.use(express.static(`${__dirname}/front`))
})

app.post('/upload', function (req, res, next) {
    // 415
    if (req.busboy) {
        req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
            console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
            file.pipe(excel())  // same as excel({sheetIndex: 0}) 
                .on('data', (data) => {
                    extractEmails(JSON.stringify(data))
                        .map((mail) => {
                            if (!email_array.includes(mail)) {
                                email_array.push(mail)
                            }
                        })
                })
                .on('close', function () {
                    console.log('done')
                    fs.writeFile(file_name, email_array.join('\r\n'), function (err) {
                        if (err) {
                            return console.log(err)
                        }
                        else {
                            res.download(`${__dirname}/${file_name}`);
                            console.log("The file was saved!")
                            console.log(`We save ${email_array.length} emails !`)
                        }
                    });
                });
        });
    }
})

function extractEmails(text) {
    return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
}
