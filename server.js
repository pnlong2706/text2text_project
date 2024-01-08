const http = require("http");
const fs = require("fs");
const URL = require("url");

var users;
fs.readFile('users.JSON', (err, data) => {
    if (err) throw err;
    users = JSON.parse(data);
});

function hash(s) {
    let N = s.length;
    let cs = "";
    for(let i = 0; i<N; i++) {
      cs += String.fromCharCode((s[i].charCodeAt(0) * 10007 + 1063 )%26 + 97);675
      cs += s[i%2];
    }
    return cs;
}

const server = http.createServer((req, res) => {
    
    let url_ = URL.parse(req.url, true)
    //console.log(req.url);
    if( req.url === "/" ) {
        res.writeHead(200, { "Content-Type": "text/html" });
        fs.readFile("index.html", (err, data) => {
            if (err) throw err;
            res.end(data);
        });
    }

    else if( req.url === "/checkvalid" && req.method == "POST" ) {
        let body = ""
        req.on("data", function (chunk) {
            body += chunk ;
            console.log(body);
        });
        req.on("end", function () {
            let id = body.split("=")[0]
            let pass = body.split("=")[1]
            
            if(users.hasOwnProperty(id)) {
                //console.log(users[id]);
                if( users[id] == pass ) res.end( "hp=" + hash(pass));
                else res.end("-1");
            }
            else res.end("-1"); 
        });
    }

    else if( url_.pathname === "/navigation" ) {
        let id = url_.search.substring(4,10); 
        let hp_check = url_.search.slice(14);

        //console.log(users[id]);
        //console.log(hp_check);
        if(hp_check != hash(users[id]) ) {
            fs.readFile("index.html", (err, data) => {
                if (err) throw err;
                res.end(data);
            });
        }
        else {
            fs.readFile("user_pannel.html", (err, data) => {
                if (err) throw err;
                res.end(data + "<script> user_id = '" + id +  "'; </script>" );
            });
        }
    }

    else if( req.url === "/go_box_chat" && req.method == "POST" ) {
        let body = ""
        req.on("data", function (chunk) {
            body += chunk ;
            //console.log(body);
        });
        req.on("end", function () {
            let id_to = body.split(".")[1];
            let id_from = body.split(".")[0];
            
            if(users.hasOwnProperty(id_to)) {
                res.end(hash(users[id_from]));
            }

            else res.end("-1"); 
        });
    }

    else if( url_.pathname == "/boxchat" ) {
        let id_from = url_.search.substring(8,14);
        let id_to = url_.search.substring(20,26);
        let hp = url_.search.slice(30);

        // console.log(id_from);
        // console.log(id_to);
        // console.log(hp);

        if(hash(users[id_from]) == hp ) {
            fs.readFile("box_chat.html", (err, data) => {
                if (err) throw err;
                res.end(data + " <script> id_from = '"+ id_from + "'; id_to='" + id_to + 
                "'; id_mess = merge(); loadmess(); </script>");
            });
        }
        else {
            fs.readFile("index.html", (err, data) => {
                if (err) throw err;
                res.end(data);
            });
        }
    }

    else if( req.url === "/sendmess" && req.method == "POST" ) {
        let body = "";
        req.on("data", function (chunk) {
            body += chunk;
            console.log(body);
        });
        req.on("end", function () {
            const text = JSON.parse(body).mess_text;
            let id_new = JSON.parse(body).id_prev;
            

            let num = 1;
            if (id_new != "undefined") {
                num = Number(id_new.slice(4));
                num++;
            }

            fs.appendFile( 'mess' + JSON.parse(body).id_mess + '.txt', '<p id = "mess' + num + '">' + text + '</p>\n', err => {
                if (err) throw err;
                console.log('Mess saved!');
            });

            res.end('<p id = "mess' + num + '">' + text + '</p>');
        });
    }

    else if( req.url === "/loading" && req.method=="POST" ) {
        let body = "";
        req.on("data", function (chunk) {
            body += chunk;
            console.log(body);
        });
        req.on('end', function () {
            let filename = body.split("=")[1];
            console.log('mess' + filename + '.txt');
            fs.readFile('mess' + filename + '.txt', (err, data) => {
                if (err) throw err;
                res.end(data);
            });
        });
    }

    else if( req.url ==="/update" && req.method == "POST" ) {
        let body = "";
        req.on("data", function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            let lastId = Number(body.split("=")[1]);
            let filename = body.split("=")[2];
            fs.readFile('mess' + filename + '.txt', (err, data) => {
                if (err) throw err;

                let s = data.toString();
                //console.log(s);
                let j = -1;
                for(let i=0; i<=lastId; i++) {
                    j = s.indexOf("<p", j+1);
                    //console.log(j);
                    if(j==-1) break;
                }

                if(j==-1) res.end("-1");
                else {
                    //console.log(s.slice(j+1));
                    res.end(s.slice(j));
                }
            });
        });
    }

    else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        //console.log(req.url);
        fs.readFile("box_chat.html", (err, data) => {
            if (err) throw err;
            res.end(data);
        });
    }
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});