// User Flow 
// Message Come on our whatsapp.
// first get the comapny name from the message.
// check user exits or not
// if yes then send the magic link
// if no add in our database 
// then send magic link

"use strict";

const token = process.env.WHATSAPP_TOKEN;

const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  axios = require("axios").default,
  app = express().use(body_parser.json()); // creates express http server

app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

app.post("/webhook", (req, res) => {
  let body = req.body;

  
  if (req.body.object) {
    if (
      req.body.entry &&
      req.body.entry[0].changes &&
      req.body.entry[0].changes[0] &&
      req.body.entry[0].changes[0].value.messages &&
      req.body.entry[0].changes[0].value.messages[0]
    ) {
      let phone_number_id =
        req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let from = req.body.entry[0].changes[0].value.messages[0].from; 
      let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; 
      axios({
        method: "POST", 
        url:
          "https://graph.facebook.com/v15.0/" +
          phone_number_id +
          "/messages?access_token=" +
          token,
        data: {
          messaging_product: "whatsapp",
          to: from,
          text: {
            body: "Ack: " + msg_body,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
  try {

  if (req.body.entry[0].changes[0].value.messages[0].type == "text") {
    let text=req.body.entry[0].changes[0].value.messages[0].text.body;
    let substring="Hey I  want to signup"; 
    if (text.includes(substring))
    {
      let userName =req.body.entry[0].changes[0].value.contacts[0].profile.name;
      let phoneNumber = req.body.entry[0].changes[0].value.contacts[0].wa_id;
      let phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
      let companyName=text.match(/'([^']+)'/)[1];
      getLink(companyName,phoneNumber, userName, phone_number_id);
    }
  }
  }catch(err){
    return;
  }
});

app.get("/webhook", (req, res) => {
  const verify_token = "a glitch";

  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];
  if (mode && token) {
    if (mode === "subscribe" && token === verify_token) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

//enter data in our database
function enterData(erty, pho,phone_number_id,redirect,companyId) {
  var XMLHttpRequest = require("xhr2");

  let xhr = new XMLHttpRequest();
  xhr.open("POST", "your Api Link");
  xhr.setRequestHeader("Accept", "*/*");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", "Bearer ");

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      getID(pho, phone_number_id,redirect,companyId);
    }
  };
  let data = `{
    "name": "${erty}",
      "phoneNo":"${pho}",
      "company":"${companyId}"
      
  }`;
  
  xhr.send(data);
}

//his uniqueID ID
function getID(phoneNos, phone_number_id,redirect,companyId) {
  var XMLHttpRequest = require("xhr2");

  let xhr = new XMLHttpRequest();
  xhr.responseType = "json";
  xhr.open(
    "GET",""
  );
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader(
    "Authorization",
    "Bearer "
  );
  let temString;
  xhr.onreadystatechange = function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      let obj = xhr.response;
      const myJSON = JSON.stringify(obj);
      let myObj = JSON.parse(myJSON);
      temString = myObj.response.results[0]._id;
      mycallback(temString, phoneNos, phone_number_id,redirect);
    }
  };
  xhr.send();
}

//send the message with magic link
function mycallback(result, pho, phone_number_id,redirect) {
  axios({
    method: "POST", 
    url:
      "https://graph.facebook.com/v15.0/" +
      phone_number_id +
      "/messages?access_token=" +
      "",
    data: {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: pho,
      type: "template",
      template: {
        name: "userauth",
        language: {
          code: "en",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text:
                  redirect +"?token="+ result,
              },
            ],
          },
        ],
      },
    },
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "",
    },
  });
}

//check the user if exits in our database
function checkUser(phoneNoo, userName, phone_number_id,redirect,companyId) {
  var XMLHttpRequest = require("xhr2");
  let xhr = new XMLHttpRequest();
  xhr.open(
    "Get","your Api Link"
  );
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  
  let tempString;
  xhr.onreadystatechange =  function () {
    if (xhr.readyState == XMLHttpRequest.DONE) {
      let obj = xhr.response;
      const myJSON = JSON.stringify(obj);
      let myObj = JSON.parse(myJSON);
      myObj = JSON.parse(myObj);
      tempString = myObj.response.results;
      var size = Object.keys(tempString).length;
      if (size == 0) {
        enterData(userName, phoneNoo,phone_number_id,redirect,companyId);
      }
      else{
      getID(phoneNoo, phone_number_id,redirect,companyId);
      }
    }
  };
  xhr.send();
}

//get the redirect link of company
function getLink(companyName,phoneNumber, userName, phone_number_id) {
    var XMLHttpRequest = require("xhr2");

    let xhr = new XMLHttpRequest();
    xhr.open("Get","You Api URL"
    );
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
    let tempString;
    xhr.onreadystatechange = function() {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            let obj = xhr.response;
            const myJSON = JSON.stringify(obj);
            let myObj = JSON.parse(myJSON);
            myObj = JSON.parse(myObj);
            tempString = myObj.response.results;
            var size = Object.keys(tempString).length;
            let redirect=tempString[0].Redirect_URL;
            let companyId=tempString[0]._id
            checkUser(phoneNumber, userName, phone_number_id,redirect,companyId);

        }
    }
    xhr.send();
}
