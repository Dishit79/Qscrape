const express = require("express");
const parser = require("node-html-parser");
const axios = require("axios");
var decode = require('urldecode')

const app = express();

const listener = app.listen(8170, function () {
    console.log(`[Qscrape] We're live on port ${listener.address().port}!`);
});

app.get("/", async (req, res) => {
    res.send({ success: true });
});

app.get("/search", async (req, res) => {
    if (req.query.password == "aVLhgkpS8X4Gb9Cp") {
        var query = req.query.q;

        var response = await axios.get(`https://bing.com/search?q=${query}`)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
                return false;
            })

        var response2 = await axios.get(`https://bing.com/search?q=${query}&first=7`)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
                return false;
            })

        if (response && response2) {
            var document = parser.parse(response);

            var results = document.querySelectorAll("#b_results > .b_algo");

            var resultsArray = [];

            for (var i in results) {
                var result = results[i];
                result = parser.parse(`<div class="qdex-result">${result.innerHTML}</div>`);

                var obj = {};
                obj.title = (result.querySelector("h2 > a")) ? result.querySelector("h2 > a").innerHTML : "";
                obj.url = (result.querySelector("h2 > a")) ? result.querySelector("h2 > a").rawAttributes.href : "";
                obj.description = (result.querySelector(".b_caption > p")) ? result.querySelector("h2 > a").innerHTML : "";

                resultsArray.push(obj);
            }

            var document2 = parser.parse(response2);

            var results2 = document2.querySelectorAll("#b_results > .b_algo");

            var resultsArray2 = [];

            for (var i in results2) {
                var result = results2[i];
                result = parser.parse(`<div class="qdex-result">${result.innerHTML}</div>`);

                var obj = {};
                obj.title = (result.querySelector("h2 > a")) ? result.querySelector("h2 > a").innerHTML.split("<strong>").join("").split("</strong>").join("") : "";
                obj.url = (result.querySelector("h2 > a")) ? result.querySelector("h2 > a").rawAttributes.href : "";
                obj.description = (result.querySelector(".b_caption > p")) ? result.querySelector("h2 > a").innerHTML.split("<strong>").join("").split("</strong>").join("") : "";

                resultsArray2.push(obj);
            }

            resultsArray = resultsArray.concat(resultsArray2);

            res.send({ success: true, results: resultsArray });
        }
    }
});