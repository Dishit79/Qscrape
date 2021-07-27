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
    if (req.query.password == "aVLhgkpS8X4Gb9Cp" && req.query.q) {
        var query = req.query.q;

        //&setmkt=en-us

        var response = await axios.get(`https://bing.com/search?q=${query}`)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log(error);
                return false;
            })

        if (response) {
            var document = parser.parse(response);

            var link2 = (document.querySelectorAll(`.b_pag a`) !== 0) ? document.querySelectorAll(`.b_pag a`) : false;

            if (link2) {
                link2.forEach((element) => {
                    if (element.innerHTML == "2") {
                        link2 = element.rawAttributes.href;
                    }
                })

                var response2 = await axios.get(`https://www.bing.com${link2}`)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    console.log(error);
                    return false;
                })

                console.log(`https://www.bing.com${link2}`)
            }

            var results = document.querySelectorAll("#b_results > .b_algo");

            var resultsArray = [];

            for (var i in results) {
                var result = results[i];
                result = parser.parse(`<div class="qdex-result">${result.innerHTML}</div>`);

                var obj = {};
                obj.title = (result.querySelector("h2 > a")) ? result.querySelector("h2 > a").innerHTML.split("<strong>").join("").split("</strong>").join("") : "";
                obj.url = (result.querySelector("h2 > a")) ? result.querySelector("h2 > a").rawAttributes.href : "";
                obj.description = (result.querySelector(".b_caption > p")) ? result.querySelector("h2 > a").innerHTML.split("<strong>").join("").split("</strong>").join("") : "";

                resultsArray.push(obj);
            }

            if (response2) {
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
            }

            resultsArray = resultsArray.concat(resultsArray2);

            res.send({ success: true, results: resultsArray });
        }
    }
});
