const express = require("express");
const scrap = require("./scrap");

let data = null;

function getData() {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data) {
                data = await scrap()
            }
            resolve(data)
        } catch (e) {
            reject(e)
        }
    })
}

const createService = () => {
    const app = express();

    app.get("/quotes", async (req, res) => {

        const { quotes } = await getData()

        let response = {}

        if (req.query.author) {
            response = {
                data: quotes.filter(quote => quote.author === req.query.author)
            }
        } else if (req.query.tag) {
            response = {
                data: quotes.filter(quote => quote.tags.includes(req.query.tag))
            }
        } else {
            response = {
                data: quotes
            }
        }

        res.json(response)
    })


    app.get("/authors", async (req, res) => {

        const { authors } = await getData()

        let response = {}

        if (req.query.name) {
            response = {
                data: authors.filter(author => author.name === req.query.name)
            }
        }  else {
            response = {
                data: authors
            }
        }

        res.json(response)
    })

    return app;
};

module.exports = {createService};
