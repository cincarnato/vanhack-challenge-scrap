const jsdom = require("jsdom");
const {JSDOM} = jsdom;

const BASE_URL = 'http://quotes.toscrape.com/'


const scrap = function () {
    return new Promise(async (resolve, reject) => {
        try {
            let quotes = []
            let authors = []
            let authorsLink = []
            let nextPage = BASE_URL

            do {
                let parsePageResult = await scrapQuotesPage(nextPage)
                quotes = quotes.concat(parsePageResult.quotes)

                parsePageResult.authorsLink.forEach(authorLink => {
                    if (!authorsLink.includes(authorLink)) {
                        authorsLink.push(authorLink)
                    }
                })

                nextPage = parsePageResult.nextPage
            } while (nextPage != null)


            let authorPromises = []
            for(let index in authorsLink){
                //let {name, biography, birthdate, location} = await scrapAuthorPage(authorsLink[index])
                //authors.push({name, biography,birthdate, location})
                authorPromises.push(scrapAuthorPage(authorsLink[index]))
            }

            await Promise.all(authorPromises).then(values => {
                authors = values
            })


            resolve({quotes, authors})
        } catch (e) {
            reject(e)
        }

    })
}


function scrapAuthorPage(url) {

    return new Promise((resolve, reject) => {
        JSDOM.fromURL(url)
            .then(dom => {
                let name = dom.window.document.querySelector('.author-title').textContent
                let birthdate = dom.window.document.querySelector('.author-born-date').textContent
                let location = dom.window.document.querySelector('.author-born-location').textContent
                let biography = dom.window.document.querySelector('.author-description').textContent

                resolve({
                    name,
                    biography: biography.trim().slice(0, 50),
                    birthdate,
                    location
                })

            })
    })

}

function scrapQuotesPage(url) {

    return new Promise((resolve, reject) => {
        JSDOM.fromURL(url)
            .then(dom => {

                //Quotes
                let quotes = []
                let authorsLink = []
                let domQuotes = dom.window.document.querySelectorAll('.quote')
                domQuotes.forEach(quote => {
                    let text = quote.querySelector('.text').textContent
                    let author = quote.querySelector('.author').textContent
                    let authorLink = quote.querySelector('a').href
                    let domTags = quote.querySelectorAll('.tag')
                    let tags = []
                    if (domTags) {
                        domTags.forEach(tag => {
                            tags.push(tag.textContent)
                        })
                    }

                    if (!authorsLink.includes(authorLink)) {
                        authorsLink.push(authorLink)
                    }

                    quotes.push({
                        author,
                        text: text.trim().slice(0, 50),
                        tags: tags
                    })
                })

                //NextPage
                let nextPage = null
                let domNext = dom.window.document.querySelector('.next')

                if (domNext) {
                    nextPage = domNext.querySelector('a').href
                }

                //Resolve
                resolve({
                    authorsLink: authorsLink,
                    quotes: quotes,
                    nextPage: nextPage
                })

            })
            .catch(e => {
                console.error(e)
                reject(e)
            })
    })

}

module.exports = scrap
