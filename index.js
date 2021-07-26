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

    var response = await axios.get(`https://html.duckduckgo.com/html?q=${query}`)
        .then(function (response) {
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
            return false;
        })

    if (response) {
        var document = parser.parse(response);

        var DDGresults = document.querySelectorAll(".results > .result > .links_main");
        var results = parseEntries(DDGresults);

        var formData = document.querySelector(".results > .nav-link > form").innerHTML;
        formData = parseFormData(formData);

        var toURL = "https://html.duckduckgo.com/html";

        var ii = 0;
        for (var i in formData) {
            ii++;
            var item = formData[i];

            if (ii == 1) {
                toURL = toURL + `?${i}=${item}`;
            } else {
                toURL = toURL + `&${i}=${item}`;
            }
        }

        var response2 = await axios.get(toURL)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                return false;
            });

        if (response2) {
            var document2 = parser.parse(response2);

            var DDGresults2 = document2.querySelectorAll(".results > .result > .links_main");
            var results2 = parseEntries(DDGresults2);

            results = results.concat(results2);
        }

        var responseObj = {
            success: true,
            results: results
        }

        res.header("Content-Type", "application/json");
        res.send(JSON.stringify(responseObj, null, 4));
    } else {
        res.send({ success: false, code: "AXIOS_ERROR" });
    }
	}
});

function parseFormData(form) {
    var document = parser.parse(form);
    var inputs = document.querySelectorAll("input");

    var obj = {};

    for (var i in inputs) {
        var input = inputs[i];

        if (input.rawAttributes.name) {
            obj[input.rawAttributes.name] = input.rawAttributes.value;
        }
    }

    return obj;
}

function parseEntries(DDGresults) {
    var results = [];

    for (var i in DDGresults) {
        var item = DDGresults[i];

        item = parser.parse("<div class='qscrape-body'>" + item.innerHTML + "</div>");

        var obj = {};
        obj.title = item.querySelector(".qscrape-body > h2 > a").innerHTML;
        obj.url = decode(item.querySelector(".result__a").rawAttributes.href.split("//duckduckgo.com/l/?uddg=")[1].split("&amp;rut=")[0]);
        obj.description = (item.querySelector(".qscrape-body > .result__snippet")) ? item.querySelector(".qscrape-body > .result__snippet").innerHTML : "";

        results.push(obj);
    }

    return results;
}